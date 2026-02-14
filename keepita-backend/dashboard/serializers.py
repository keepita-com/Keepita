import hashlib
import os
import os.path
import json
import zipfile
import shutil
import time
import uuid
import threading
import logging
import io
import subprocess
from pathlib import Path
from typing import Optional, List
from Crypto.Cipher import AES
import biplist
import struct
import sqlite3

from django.utils import timezone
from rest_framework import serializers
from django.core.files.storage import default_storage
from django.conf import settings
from .models import Backup, BackupLog, Notification, ClientInstance
from .extractors import (
    ContactExtractor, 
    CallLogExtractor,
    MessageExtractor,
    AppExtractor,
    BluetoothExtractor,
    WifiExtractor,
    FileExtractor,
    BrowserExtractor,
    AlarmExtractor,
    WorldClockExtractor,
    DecryptionProxy,
    HomeScreenExtractor,
    WallpaperExtractor,
    XiaomiAlarmExtractor,
    XiaomiAppExtractor,
    XiaomiWifiExtractor,
    XiaomiMessageExtractor,
    XiaomiNoteExtractor,
    XiaomiBrowserExtractor,
    XiaomiContactExtractor,
    XiaomiMetadataExtractor,
    XiaomiFileExtractor,
    XiaomiDecryptionProxy,
    IOSContactExtractor,
    IOSDecryptionProxy,
    IOSMessageExtractor,
    IOSCalendarExtractor,
    IOSNoteExtractor,
    IOSFileExtractor,
    IOSWallpaperExtractor,
    IOSHomeScreenExtractor,
    IOSNotificationExtractor,
    IOSSafariExtractor,
    IOSReminderExtractor,
    IOSBluetoothExtractor,
    AndroidAppExtractor,
    AndroidFileExtractor,
    AndroidMessageExtractor,
    AndroidDecryptionProxy,
)
from .utils.notification import send_notification

from .utils.android_helper import prepare_android_backup

logger = logging.getLogger('dashboard')

QUAD = struct.Struct('>Q')
ZERO_IV = b'\0' * 16
WRAP_PASSCODE = 2

def aes_unwrap_key(kek: bytes, wrapped: bytes, iv: int = 0xa6a6a6a6a6a6a6a6) -> Optional[bytes]:
    n = len(wrapped) // 8 - 1
    if n < 1: return None
    R = [None] + [wrapped[i*8:(i+1)*8] for i in range(1, n + 1)]
    A = QUAD.unpack(wrapped[:8])[0]
    decrypt = AES.new(kek, AES.MODE_ECB).decrypt
    for j in range(5, -1, -1):
        for i in range(n, 0, -1):
            ciphertext = QUAD.pack(A ^ (n * j + i)) + R[i]
            B = decrypt(ciphertext)
            A = QUAD.unpack(B[:8])[0]
            R[i] = B[8:]
    if A != iv:

        pass
    return b"".join(R[1:])

def aes_decrypt_cbc(data: bytes, key: bytes) -> bytes:
    if not data or len(data) % 16 != 0:
        data = data[:len(data) - (len(data) % 16)]
    if not data: return b''
    cipher = AES.new(key, AES.MODE_CBC, iv=ZERO_IV)
    return cipher.decrypt(data)

def loopTLVBlocks(blob: bytes):
    i = 0
    while i + 8 <= len(blob):
        try:
            tag = blob[i:i+4]
            length = struct.unpack(">L", blob[i+4:i+8])[0]
            data = blob[i+8:i+8+length]
            yield (tag, data)
            i += 8 + length
        except (struct.error, IndexError):
            break

class Keybag:
    def __init__(self, data: bytes):
        self.attrs = {}
        self.classKeys = {}
        self._parse_binary_blob(data)

    def _parse_binary_blob(self, data: bytes):
        CLASSKEY_TAGS = [b"CLAS", b"WRAP", b"WPKY", b"KTYP", b"PBKY", b"UUID"]
        currentClassKey = {}
        for tag, blob_data in loopTLVBlocks(data):
            if len(blob_data) == 4 and tag != b'CLAS':
                unpacked_data = struct.unpack(">L", blob_data)[0]
            else:
                unpacked_data = blob_data
            if tag == b"CLAS":
                if currentClassKey: self.classKeys[currentClassKey[b"CLAS"]] = currentClassKey
                currentClassKey = {b"CLAS": blob_data}
            elif tag in CLASSKEY_TAGS:
                if currentClassKey: currentClassKey[tag] = unpacked_data
            else:
                self.attrs[tag] = unpacked_data
        if currentClassKey: self.classKeys[currentClassKey[b"CLAS"]] = currentClassKey
        
    def unlockWithPasscode(self, passcode: str) -> bool:
        passcode_bytes = passcode.encode('utf-8')
        dpsl = self.attrs.get(b"DPSL")
        dpic = self.attrs.get(b"DPIC")
        salt = self.attrs.get(b"SALT")
        iterations = self.attrs.get(b"ITER")
        if not all([dpsl, dpic, salt, iterations]):
            logger.error("Failed to unlock Keybag: PBKDF2 attributes (SALT, ITER, etc.) are missing.")
            return False

        passcode1 = hashlib.pbkdf2_hmac('sha256', passcode_bytes, dpsl, dpic, 32)
        passcode_key = hashlib.pbkdf2_hmac('sha1', passcode1, salt, iterations, 32)
        unlocked_count = 0
        for _, classkey_data in self.classKeys.items():
            if classkey_data.get(b"WRAP") and (classkey_data.get(b"WRAP") & WRAP_PASSCODE):
                wpky = classkey_data.get(b"WPKY")
                if wpky:
                    key = aes_unwrap_key(passcode_key, wpky)
                    if key:
                        classkey_data["KEY"] = key
                        unlocked_count += 1
        return unlocked_count > 0

    def unwrapKeyForClass(self, protection_class: int, persistent_key: bytes) -> Optional[bytes]:
        class_key_bytes = struct.pack('>L', protection_class)
        classkey_data = self.classKeys.get(class_key_bytes)
        if not classkey_data or "KEY" not in classkey_data or len(persistent_key) != 0x28:
            return None
        return aes_unwrap_key(classkey_data["KEY"], persistent_key)

class BackupUploadSerializer(serializers.ModelSerializer):
    backup_file = serializers.FileField(write_only=True)
    log_id = serializers.UUIDField(read_only=True)
    
    device_brand = serializers.ChoiceField(
        choices=Backup.DEVICE_BRAND_CHOICES, 
        required=True,
        help_text="Specify the device brand ('samsung', 'xiaomi', 'ios')."
    )
    
    class Meta:
        model = Backup
        fields = ['id', 'name', 'model_name', 'password', 'size', 'user', 
                  'created_at', 'updated_at', 'backup_file', 'status', 'log_id', 'device_brand'] 
        read_only_fields = ['id', 'size', 'created_at', 'updated_at', 'log_id', 'status']
        extra_kwargs = {
            'user': {'required': False},
            'model_name': {'required': False},
            'name': {'required': False},
            'password': {'required': False, 'write_only': True}
        }
    
    def validate_backup_file(self, value):
        if not value.name.endswith('.zip'):
            raise serializers.ValidationError("File must be a ZIP archive.")
        return value

    def _extract_zip_safely(self, zip_path: Path, extract_dir: Path, log=None) -> bool:
        logger.info(f"Starting extraction of {zip_path} to {extract_dir}")
        step_number, step_name = 4, 'extract_zip'
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                total_files = len(zip_ref.infolist())
                if log:
                    log.update_step(step_number, step_name, f"Extracting {total_files} files from archive...", 10)
                zip_ref.extractall(extract_dir)
            if log:
                log.update_step(step_number, step_name, "ZIP extraction complete.", 100, 'completed')
            logger.info("Extraction completed successfully.")
            return True
        except (zipfile.BadZipFile, OSError) as e:
            msg = f"ZIP extraction failed: {e}"
            if log:
                log.update_step(step_number, step_name, msg, 0, 'failed')
            logger.error(msg)
            return False
    
    def _safe_cleanup(self, directory_str: str):
        directory = Path(directory_str)
        if not directory.exists():
            return
        logger.info(f"Attempting to clean up directory: {directory_str}")
        try:
            shutil.rmtree(directory, ignore_errors=True)
        except Exception as e:
            logger.warning(f"Cleanup failed for {directory}: {str(e)}")

    def _decrypt_ios_backup(self, backup_path_str: str, output_dir_str: str, password: str, log=None) -> Optional[str]:
        logger.info("Starting iOS backup decryption process using iphone_backup_decrypt.")
        step_number, step_name = 5, 'decrypt_ios_backup'
        if log:
            log.update_step(step_number, step_name, "Initializing iOS decryption...", 0)

        try:
            from iphone_backup_decrypt import EncryptedBackup
            
            backup_path = Path(backup_path_str)
            output_dir = Path(output_dir_str)
            
            decrypted_files_root = output_dir / "Decrypted_Files"
            decrypted_files_root.mkdir(parents=True, exist_ok=True)
            
            logger.info(f"Attempting to decrypt iOS backup at: {backup_path}")
            if log:
                log.update_step(step_number, step_name, "Unlocking backup with password...", 10)
            
            backup = EncryptedBackup(backup_directory=str(backup_path), passphrase=password)
            
            logger.info("Backup unlocked successfully. Extracting files...")
            if log:
                log.update_step(step_number, step_name, "Extracting decrypted files...", 30)
            
            backup.extract_files(
                domain_like='%',
                output_folder=str(decrypted_files_root),
                preserve_folders=True,
                domain_subfolders=True
            )
            
            file_count = sum(1 for _ in decrypted_files_root.rglob('*') if _.is_file())
            
            logger.info(f"Decryption complete. {file_count} files extracted to {decrypted_files_root}")
            if log:
                log.update_step(step_number, step_name, f"Decryption complete: {file_count} files extracted.", 100, 'completed')
            
            return str(decrypted_files_root)

        except Exception as e:
            msg = f"iOS decryption process failed: {e}"
            logger.error(msg, exc_info=True)
            if log:
                log.update_step(step_number, step_name, msg, 0, 'failed')
            return None
    
    def _process_backup(self, extract_dir, backup_id, backup_type, log=None):
        logger.info(f"Starting data extraction for {backup_type} backup ID: {backup_id}")
        stats = {}

        if backup_type == 'xiaomi':

            extractors = [
                ('proxy', XiaomiDecryptionProxy(str(extract_dir), backup_id)),
                ('metadata', XiaomiMetadataExtractor(str(extract_dir), backup_id)),    
                ('contacts', XiaomiContactExtractor(str(extract_dir), backup_id)),      
                ('messages', XiaomiMessageExtractor(str(extract_dir), backup_id)),     
                ('apps', XiaomiAppExtractor(str(extract_dir), backup_id)),             
                ('wifi', XiaomiWifiExtractor(str(extract_dir), backup_id)),            
                ('files', XiaomiFileExtractor(str(extract_dir), backup_id)),            
                ('browser', XiaomiBrowserExtractor(str(extract_dir), backup_id)), 
                ('alarms', XiaomiAlarmExtractor(str(extract_dir), backup_id)),          
                ('notes', XiaomiNoteExtractor(str(extract_dir), backup_id)),            
            ]
            
        elif backup_type == 'ios':
            extractors = [
                ('proxy', IOSDecryptionProxy(str(extract_dir), backup_id)),
                ('contacts', IOSContactExtractor(str(extract_dir), backup_id)),       
                ('messages', IOSMessageExtractor(str(extract_dir), backup_id)),        
                ('calendar', IOSCalendarExtractor(str(extract_dir), backup_id)),     
                ('notes', IOSNoteExtractor(str(extract_dir), backup_id)),              
                ('homescreen', IOSHomeScreenExtractor(str(extract_dir), backup_id)),    
                ('files', IOSFileExtractor(str(extract_dir), backup_id)),               
                ('wallpapers', IOSWallpaperExtractor(str(extract_dir), backup_id)),    
                ('notifications', IOSNotificationExtractor(str(extract_dir), backup_id)),
                ('safari', IOSSafariExtractor(str(extract_dir), backup_id)),         
                ('reminders', IOSReminderExtractor(str(extract_dir), backup_id)),
                ('bluetooth', IOSBluetoothExtractor(str(extract_dir), backup_id))
            ]

        elif backup_type == 'android':
            extractors = [
                ('proxy', AndroidDecryptionProxy(str(extract_dir), backup_id)),
                ('apps', AndroidAppExtractor(str(extract_dir), backup_id)),
                ('files', AndroidFileExtractor(str(extract_dir), backup_id)),
                ('messages', AndroidMessageExtractor(str(extract_dir), backup_id)),
            ]
            
        elif backup_type == 'samsung': 
            extractors = [
                ('decrypt', DecryptionProxy(extract_dir, backup_id)),
                ('contacts', ContactExtractor(extract_dir, backup_id)),
                ('call_logs', CallLogExtractor(extract_dir, backup_id)),
                ('messages', MessageExtractor(extract_dir, backup_id)),
                ('apps', AppExtractor(extract_dir, backup_id)),
                ('bluetooth', BluetoothExtractor(extract_dir, backup_id)),
                ('wifi', WifiExtractor(extract_dir, backup_id)),
                ('files', FileExtractor(extract_dir, backup_id)),
                ('browser', BrowserExtractor(extract_dir, backup_id)),
                ('alarms', AlarmExtractor(extract_dir, backup_id)),
                ('world_clocks', WorldClockExtractor(extract_dir, backup_id)),
                ('homescreen', HomeScreenExtractor(extract_dir, backup_id)),
                ('wallpapers', WallpaperExtractor(extract_dir, backup_id)),
            ]

        else:
            raise ValueError(f"Unsupported backup type: {backup_type}")
            
        for name, extractor in extractors:
            try:
                count = extractor.extract()
                stats[name] = {'count': count}
                logger.info(f"Extracted {count} {name} for backup {backup_id}")
            except Exception as e:
                logger.error(f"Error extracting {name} for backup {backup_id}: {str(e)}", exc_info=True)
                stats[name] = {'error': str(e)}
        return stats

    def _repair_contacts_db(self, decrypted_root_path: Path) -> bool:
        contact_db_path = decrypted_root_path / "HomeDomain" / "Library/AddressBook/AddressBook.sqlitedb"
        
        if not contact_db_path.exists():
            logger.info("Contacts DB not found for repair attempt.")
            return False

        repaired_db_path = contact_db_path.with_name("AddressBook.repaired.sqlitedb")
        
        logger.info(f"Attempting to repair contacts DB: {contact_db_path}")

        dump_command = f"sqlite3 '{contact_db_path.resolve()}' .dump"
        
        try:
            process = subprocess.run(dump_command, shell=True, capture_output=True, text=True, check=True)
            sql_dump = process.stdout
            
            if not sql_dump:
                logger.warning("Contacts DB dump was empty. Cannot repair.")
                return False

            restore_command = f"sqlite3 '{repaired_db_path.resolve()}'"
            
            subprocess.run(restore_command, shell=True, input=sql_dump, text=True, check=True)
            
            if repaired_db_path.exists() and repaired_db_path.stat().st_size > 0:
                logger.info(f"Successfully repaired contacts DB to: {repaired_db_path}")
                return True
            else:
                logger.error("Repair process completed, but the new DB file is empty or missing.")
                return False

        except subprocess.CalledProcessError as e:

            logger.error(f"sqlite3 CLI failed to process the contacts DB. It might be too corrupt to repair. Error: {e.stderr}")
            return False
        except Exception as e:
            logger.error(f"An unexpected error occurred during DB repair: {e}")
            return False

    def _process_backup_async(self, backup_instance, extract_dir_path: Path, temp_zip_path: Path, log=None):
        logger.info(f"Starting async processing for backup ID: {backup_instance.id}")
        
        backup_id = backup_instance.id
        decrypted_root_path = None
        organized_android_dir = None

        try:
            Backup.objects.filter(pk=backup_id).update(status='processing')
            if log: log.status = 'processing'; log.save(update_fields=['status'])

            extract_dir_path.mkdir(parents=True, exist_ok=True)

            if not self._extract_zip_safely(temp_zip_path, extract_dir_path, log):
                raise Exception("Failed to extract the ZIP archive. The file may be corrupt.")

            source_data_root = extract_dir_path
            backup_type = backup_instance.device_brand
            
            if backup_type == 'android':
                logger.info("Android backup type detected. Preparing .ab file for extraction.")
                ab_file = next(extract_dir_path.rglob("*.ab"), None)
                if not ab_file:
                    raise FileNotFoundError("No .ab file found in the uploaded ZIP for Android backup.")
                
                logger.info(f"Found Android backup file: {ab_file}")

                organized_android_dir = Path(settings.BACKUP_EXTRACT_PATH) / f"organized_android_{backup_id}"
                
                prepare_android_backup(str(ab_file), organized_android_dir)
                
                source_data_root = organized_android_dir
            
            elif backup_type == 'ios':
                from .extractors.base_extractor import BaseExtractor
                temp_extractor = BaseExtractor(str(extract_dir_path), backup_id)
                ios_backup_folder = temp_extractor.backup_root
                
                manifest_plist = ios_backup_folder / "Manifest.plist"
                is_encrypted = False
                if manifest_plist.exists():
                    try:
                        is_encrypted = biplist.readPlist(str(manifest_plist)).get("IsEncrypted", False)
                    except Exception:
                        logger.warning(f"Could not read Manifest.plist for backup {backup_id}")

                if is_encrypted:
                    logger.info("Encrypted iOS backup detected. Decryption process starting...")
                    
                    if not backup_instance.password:
                        error_msg = "Backup is encrypted, but no password was provided."
                        raise ValueError(error_msg)

                    decryption_dir = Path(settings.BACKUP_EXTRACT_PATH) / f"decrypted_{backup_id}"
                    decryption_dir.mkdir(exist_ok=True)
                    
                    decrypted_root_path = self._decrypt_ios_backup(
                        str(ios_backup_folder), 
                        str(decryption_dir), 
                        backup_instance.password, 
                        log
                    )
                    
                    if not decrypted_root_path:

                        raise Exception("iOS backup decryption failed. Please check logs for details (e.g., incorrect password).")
                    
                    logger.info(f"Decryption successful. Using {decrypted_root_path} as data source.")
                    source_data_root = Path(decrypted_root_path)

                else:

                    logger.info("Unencrypted iOS backup detected.")
                    source_data_root = ios_backup_folder

            self._process_backup(source_data_root, backup_id, backup_type, log)
            
            Backup.objects.filter(pk=backup_id).update(status='completed')
            if log: log.mark_complete()
            send_notification(user=backup_instance.user, title="Backup Processed Successfully", message=f"Your backup '{backup_instance.name}' is now ready.")

        except Exception as e:

            logger.error(f"Critical error during backup processing for ID {backup_id}: {str(e)}", exc_info=True)
            Backup.objects.filter(pk=backup_id).update(status='failed')
            if log: log.mark_failed(str(e))
            send_notification(user=backup_instance.user, title="Backup Processing Failed", message=f"An error occurred while processing '{backup_instance.name}'.")
        finally:
            logger.info(f"Cleaning up temporary files for backup {backup_id}")
            self._safe_cleanup(str(extract_dir_path))

            if decrypted_root_path:
                 self._safe_cleanup(str(Path(settings.BACKUP_EXTRACT_PATH) / f"decrypted_{backup_id}"))

            if organized_android_dir:
                self._safe_cleanup(str(organized_android_dir))

            if temp_zip_path.exists():
                try: os.remove(temp_zip_path)
                except OSError as err: logger.warning(f"Could not remove temp ZIP {temp_zip_path}: {err}")

    def create(self, validated_data):
        request = self.context.get('request', None)
        user = None
        if request is None or not getattr(request, 'user', None):
            raise serializers.ValidationError("Request object is required.")
        user = getattr(request, 'user', None)
        if not getattr(user, 'is_authenticated', False):
            raise serializers.ValidationError("Authentication required to upload backups.")
           
        backup_file = validated_data.pop('backup_file')
        
        temp_dir = Path(settings.MEDIA_ROOT) / 'temp_zips'
        temp_dir.mkdir(parents=True, exist_ok=True)
        temp_zip_path = temp_dir / f"{uuid.uuid4()}_{backup_file.name}"
        
        with open(temp_zip_path, 'wb+') as dest:
            for chunk in backup_file.chunks():
                dest.write(chunk)
        
        validated_data.update({'user': user, 'size': backup_file.size})
        
        backup_instance = Backup.objects.create(**validated_data)
        log = BackupLog.objects.create(backup=backup_instance, total_steps=15)
        backup_instance.log_id = log.id
        
        extract_dir = Path(settings.BACKUP_EXTRACT_PATH) / f"extracted_{backup_instance.id}"

        threading.Thread(
            target=self._process_backup_async, 
            args=(backup_instance, extract_dir, temp_zip_path, log),
            daemon=True
        ).start()
        
        return backup_instance

class BackupLogSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = BackupLog
        fields = ['id', 'backup', 'status', 'current_step', 'total_steps', 
                 'progress_percentage', 'steps_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_seen', 'created_at']
                
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_seen', 'created_at']
        
class ClientInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientInstance
        fields = ['id', 'name', 'url', 'is_active', 'key', 'created_at']
        read_only_fields = ['key', 'created_at']
        
class ClientRegistrationSerializer(serializers.ModelSerializer):
    mac_address = serializers.CharField(
        max_length=17, 
        required=True,
        validators=[] 
    )

    class Meta:
        model = ClientInstance
        fields = ['name', 'mac_address', 'os_type']
        extra_kwargs = {
            'os_type': {'required': True},
            'name': {'required': False},
        }

class BackupDetailSerializer(serializers.ModelSerializer):
    contacts_count = serializers.SerializerMethodField()
    messages_count = serializers.SerializerMethodField()
    call_logs_count = serializers.SerializerMethodField()
    apps_count = serializers.SerializerMethodField()
    files_count = serializers.SerializerMethodField()
    wifi_networks_count = serializers.SerializerMethodField()
    bluetooth_devices_count = serializers.SerializerMethodField()
    alarms_count = serializers.SerializerMethodField()
    home_screen_items_count = serializers.SerializerMethodField()
    browser_count = serializers.SerializerMethodField()
    wallpapers_count = serializers.SerializerMethodField()
    notes_count = serializers.SerializerMethodField()
    metadata_count = serializers.SerializerMethodField()
    calendar_count = serializers.SerializerMethodField()

    class Meta:
        model = Backup
        fields = [
            'id', 'name', 'model_name', 'password', 'size', 
            'status', 'created_at', 'updated_at',
            'contacts_count', 'messages_count', 'call_logs_count', 'apps_count', 
            'files_count', 'wifi_networks_count', 'bluetooth_devices_count', 
            'alarms_count', 'home_screen_items_count', 'browser_count', 'wallpapers_count', 'notes_count', 'metadata_count',
            'calendar_count','device_brand',
        ]

    def get_contacts_count(self, obj):
        return obj.contacts.count()

    def get_messages_count(self, obj):
        return obj.messages.count()

    def get_call_logs_count(self, obj):
        return obj.call_logs.count()

    def get_apps_count(self, obj):
        return obj.apk_lists.count()

    def get_files_count(self, obj):
        return obj.files.count()

    def get_wifi_networks_count(self, obj):
        return obj.wifi_networks.count()

    def get_bluetooth_devices_count(self, obj):
        return obj.bluetooth_devices.count()

    def get_alarms_count(self, obj):
        return obj.alarms.count()

    def get_home_screen_items_count(self, obj):
        return obj.home_screen_items.count()

    def get_browser_count(self, obj):
        return obj.browser_bookmarks.count() + obj.browser_histories.count() + obj.browser_downloads.count() + obj.browser_searches.count() + obj.browser_tabs.count()

    def get_wallpapers_count(self, obj):
        return obj.wallpapers.count()
    
    def get_notes_count(self, obj):
        return obj.notes.count()

    def get_metadata_count(self, obj):
        if hasattr(obj, 'metadata') and obj.metadata is not None:
            return 1

    def get_calendar_count(self, obj):
        return obj.calendar_events.count()