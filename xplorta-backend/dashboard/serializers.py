import json
import logging
import os
import shutil
import threading
import time
import zipfile
from pathlib import Path

import requests
from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from .extractors import (
    AlarmExtractor,
    AppExtractor,
    BluetoothExtractor,
    BrowserExtractor,
    CallLogExtractor,
    ContactExtractor,
    DecryptionProxy,
    FileExtractor,
    HomeScreenExtractor,
    MessageExtractor,
    WallpaperExtractor,
    WifiExtractor,
    WorldClockExtractor,
)
from .models import Backup, BackupLog, Notification
from .progress_manager import ProgressManager
from .utils.notification import send_notification

logger = logging.getLogger("dashboard")

import json
import logging
import os
import shutil
import threading
import time
import zipfile
from pathlib import Path

import requests
from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from .extractors import (
    AlarmExtractor,
    AppExtractor,
    BluetoothExtractor,
    BrowserExtractor,
    CallLogExtractor,
    ContactExtractor,
    DecryptionProxy,
    FileExtractor,
    HomeScreenExtractor,
    MessageExtractor,
    WallpaperExtractor,
    WifiExtractor,
    WorldClockExtractor,
)
from .models import Backup, BackupLog, Notification
from .progress_manager import ProgressManager
from .utils.notification import send_notification

logger = logging.getLogger("dashboard")


class BackupUploadSerializer(serializers.ModelSerializer):
    backup_file = serializers.FileField(write_only=True)
    log_id = serializers.UUIDField(read_only=True)

    class Meta:
        model = Backup
        fields = [
            "id",
            "name",
            "model_name",
            "pin",
            "size",
            "user",
            "created_at",
            "updated_at",
            "backup_file",
            "status",
            "log_id",
        ]
        read_only_fields = [
            "id",
            "size",
            "created_at",
            "updated_at",
            "log_id",
            "status",
        ]
        extra_kwargs = {
            "user": {"required": False},
            "model_name": {"required": False},
            "name": {"required": False},
        }

    def validate_backup_file(self, value):
        if not value.name.endswith(".zip"):
            raise serializers.ValidationError("File must be a ZIP archive")
        return value

    def _get_backup_name(self, backup_dir, default_name):
        default_name = os.path.splitext(default_name)[0]
        metadata_file = Path(backup_dir) / "metadata.json"
        if metadata_file.exists():
            try:
                with open(metadata_file) as f:
                    metadata = json.load(f)
                    return metadata.get("backup_name", default_name)
            except Exception as e:
                logger.error(f"Error reading metadata.json: {str(e)}")
        return default_name

    def _extract_zip_safely(self, zip_path, extract_dir, log=None):
        logger.info(f"Starting extraction of {zip_path} to {extract_dir}")
        try:
            with zipfile.ZipFile(zip_path) as zip_ref:
                total_files = len(zip_ref.infolist())
                log.update_step(
                    4, "extract_zip", f"Starting extraction of {total_files} files.", 0
                )
                zip_ref.extractall(extract_dir)
                log.update_step(
                    4,
                    "extract_zip",
                    f"Successfully extracted {total_files} files.",
                    100,
                    "completed",
                )
            logger.info("ZIP extraction completed successfully.")
            return True
        except Exception as e:
            log.update_step(
                4, "extract_zip", f"Extraction failed: {str(e)}", 0, "failed"
            )
            logger.error(f"Critical error during ZIP extraction: {str(e)}")
            return False

    def _safe_cleanup(self, directory):
        logger.info(f"Starting cleanup of directory: {directory}")
        try:
            if os.path.exists(directory):
                shutil.rmtree(directory, ignore_errors=True)
                logger.info(f"Successfully removed directory: {directory}")
        except Exception as e:
            logger.warning(f"Cleanup failed for directory {directory}: {str(e)}")

    def _process_backup(self, extract_dir, backup_id, log=None):
        stats = {}

        try:
            proxy_extractor = DecryptionProxy(extract_dir, backup_id)
            sent_files_count = proxy_extractor.extract()
            stats["decryption_proxy"] = {"sent_files": sent_files_count}

            if sent_files_count > 0:
                wait_duration = min(sent_files_count * 8, 300)
                logger.info(
                    f"Waiting for {wait_duration} seconds for decryption callbacks to arrive."
                )
                time.sleep(wait_duration)
                log.update_step(
                    5,
                    "decrypt",
                    f"Waited for {wait_duration}s. Proceeding with local data extraction.",
                    100,
                    "completed",
                )

        except Exception as e:
            logger.error(
                f"FATAL: Decryption proxy failed. Halting process. Error: {e}",
                exc_info=True,
            )
            stats["decryption_proxy"] = {"error": str(e)}
            if log:
                ProgressManager.mark_step_failed(
                    log.id, 5, "decrypt", f"Proxy communication failed: {e}"
                )
            return stats

        local_extractors = [
            (6, "contacts", ContactExtractor(extract_dir, backup_id)),
            (7, "call_logs", CallLogExtractor(extract_dir, backup_id)),
            (8, "messages", MessageExtractor(extract_dir, backup_id)),
            (9, "apps", AppExtractor(extract_dir, backup_id)),
            (10, "bluetooth", BluetoothExtractor(extract_dir, backup_id)),
            (11, "wifi", WifiExtractor(extract_dir, backup_id)),
            (12, "files", FileExtractor(extract_dir, backup_id)),
            (13, "browser", BrowserExtractor(extract_dir, backup_id)),
            (14, "alarms", AlarmExtractor(extract_dir, backup_id)),
            (15, "worldclocks", WorldClockExtractor(extract_dir, backup_id)),
            (16, "homescreen", HomeScreenExtractor(extract_dir, backup_id)),
            (17, "wallpapers", WallpaperExtractor(extract_dir, backup_id)),
        ]

        for step_num, name, extractor in local_extractors:
            try:
                count = extractor.extract()
                stats[name] = {"count": count}
            except Exception as e:
                logger.error(f"Error in extractor '{name}': {str(e)}")
                stats[name] = {"error": str(e)}
                if log:
                    ProgressManager.mark_step_failed(log.id, step_num, name, str(e))
                continue

        return stats

    def _process_backup_async(
        self, backup_instance, extract_dir, backup_file_path, log=None
    ):
        logger.info(f"Starting async processing for backup ID {backup_instance.id}")
        try:
            backup_instance.status = "processing"
            backup_instance.save()
            log.status = "processing"
            log.save()

            os.makedirs(extract_dir, exist_ok=True)

            if not self._extract_zip_safely(backup_file_path, extract_dir, log):
                backup_instance.status = "failed"
                backup_instance.save()
                log.mark_failed("Failed to extract the backup ZIP file.")
                return

            device_folder = next(
                (
                    d
                    for d in Path(extract_dir).iterdir()
                    if d.is_dir() and not d.name.startswith(".")
                ),
                None,
            )
            if device_folder:
                model_name = device_folder.name.split("_")[0]
                if model_name:
                    backup_instance.model_name = model_name
                    backup_instance.save(update_fields=["model_name"])

            stats = self._process_backup(extract_dir, backup_instance.id, log)

            if "decryption_proxy" in stats and "error" in stats["decryption_proxy"]:
                backup_instance.status = "failed"
                backup_instance.save()
                log.mark_failed("Decryption process failed.")
                return

            backup_instance.status = "completed"
            backup_instance.save()
            if log:
                log.mark_complete()
            logger.info(
                f"Processing finished successfully for backup {backup_instance.id}"
            )

        except Exception as e:
            logger.error(
                f"A critical failure occurred in the async processing thread: {str(e)}",
                exc_info=True,
            )
            backup_instance.status = "failed"
            backup_instance.save()
            if log:
                ProgressManager.mark_failed(
                    log.id, f"A critical system error occurred: {str(e)}"
                )

        finally:
            logger.info(f"Starting final cleanup for backup {backup_instance.id}")
            self._safe_cleanup(os.path.dirname(backup_file_path))
            self._safe_cleanup(extract_dir)
            send_notification(
                backup_instance.user,
                "Backup Processing Finished",
                f"The process for your backup '{backup_instance.name}' is now complete.",
            )

    def _initialize_extraction_steps(self, log):
        if not log or (log.steps_data and log.total_steps > 0):
            return
        steps = [
            (1, "upload", "Uploading backup file"),
            (2, "validate", "Validating backup file"),
            (3, "save", "Saving backup file"),
            (4, "extract_zip", "Extracting ZIP archive"),
            (5, "decrypt", "Sending essential files for secure decryption"),
            (6, "contacts", "Extracting contacts"),
            (7, "call_logs", "Extracting call logs"),
            (8, "messages", "Extracting messages"),
            (9, "apps", "Extracting apps"),
            (10, "bluetooth", "Extracting bluetooth devices"),
            (11, "wifi", "Extracting WiFi networks"),
            (12, "files", "Extracting files"),
            (13, "browser", "Extracting browser data"),
            (14, "alarms", "Extracting alarms"),
            (15, "worldclocks", "Extracting world clocks"),
            (16, "homescreen", "Extracting home screen layout"),
            (17, "wallpapers", "Extracting wallpapers"),
        ]
        log.initialize_steps(
            [{"name": name, "description": desc} for _, name, desc in steps]
        )

    def create(self, validated_data):
        backup_file = validated_data.pop("backup_file")
        user = self.context["request"].user
        try:
            backup_instance = Backup.objects.create(
                name=validated_data.get("name")
                or os.path.splitext(backup_file.name)[0],
                size=backup_file.size,
                user=user,
                status="pending",
            )
            log = BackupLog.objects.create(backup=backup_instance, status="pending")
            self._initialize_extraction_steps(log)
            log.update_step(1, "upload", "Upload completed.", 100, "completed")

            tmp_dir = (
                Path(settings.MEDIA_ROOT) / "temp_backups" / str(backup_instance.id)
            )
            os.makedirs(tmp_dir, exist_ok=True)
            temp_file_path = tmp_dir / backup_file.name

            with open(temp_file_path, "wb+") as destination:
                for chunk in backup_file.chunks():
                    destination.write(chunk)

            log.update_step(2, "validate", "Validation complete.", 100, "completed")
            log.update_step(3, "save", "Temporary save complete.", 100, "completed")

            extract_dir = str(
                Path(settings.MEDIA_ROOT)
                / "extracted_backups"
                / str(backup_instance.id)
            )

            processing_thread = threading.Thread(
                target=self._process_backup_async,
                args=(backup_instance, extract_dir, str(temp_file_path), log),
            )
            processing_thread.daemon = True
            processing_thread.start()

            backup_instance.log_id = log.id
            backup_instance.save()

            return backup_instance
        except Exception as e:
            logger.error(
                f"Error during backup creation process: {str(e)}", exc_info=True
            )
            raise serializers.ValidationError(
                f"Failed to initiate backup processing: {str(e)}"
            )


class BackupLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupLog
        fields = [
            "id",
            "backup",
            "status",
            "current_step",
            "total_steps",
            "progress_percentage",
            "steps_data",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "is_seen", "created_at"]

class BackupDetailSerializer(serializers.ModelSerializer):
    contacts_count = serializers.SerializerMethodField()
    messages_count = serializers.SerializerMethodField()
    apps_count = serializers.SerializerMethodField()
    files_count = serializers.SerializerMethodField()
    wifi_networks_count = serializers.SerializerMethodField()
    bluetooth_devices_count = serializers.SerializerMethodField()
    browser_count = serializers.SerializerMethodField()
    wallpapers_count = serializers.SerializerMethodField()

    class Meta:
        model = Backup
        fields = [
            'id', 'name', 'model_name', 'pin', 'size', 
            'status', 'created_at', 'updated_at',
            'contacts_count', 'messages_count', 'apps_count', 
            'files_count', 'wifi_networks_count', 'bluetooth_devices_count', 'browser_count', 'wallpapers_count'
        ]

    def get_contacts_count(self, obj):
        return obj.contacts.count()

    def get_messages_count(self, obj):
        return obj.messages.count()

    def get_apps_count(self, obj):
        return obj.apk_lists.count()

    def get_files_count(self, obj):
        return obj.files.count()

    def get_wifi_networks_count(self, obj):
        return obj.wifi_networks.count()

    def get_bluetooth_devices_count(self, obj):
        return obj.bluetooth_devices.count()

    def get_browser_count(self, obj):
        return obj.browser_bookmarks.count() + obj.browser_histories.count() + obj.browser_downloads.count() + obj.browser_searches.count() + obj.browser_tabs.count()

    def get_wallpapers_count(self, obj):
        return obj.wallpapers.count()
