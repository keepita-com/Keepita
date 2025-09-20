import json
import logging
import os
from pathlib import Path

from django.core.files import File as DjangoFile
from django.utils.timezone import datetime

from ..models import ApkList, ApkPermission, Backup
from .base_extractor import BaseExtractor

logger = logging.getLogger(__name__)


class AppExtractor(BaseExtractor):
    def extract(self) -> int:
        step_number = 9
        step_name = "apps"

        app_list_file = self._get_file_path("APKFILE", "AppList_ext", "AppList.json")
        self.log_info(f"Extracting applications from: {app_list_file}")

        app_count = 0
        if not app_list_file.exists():
            self.update_progress(
                step_number, step_name, "App list file not found", 0, "failed"
            )
            self.log_error(f"App list file not found at: {app_list_file}")
            return 0

        self.update_progress(
            step_number, step_name, "Starting application extraction", 0
        )
        try:
            backup = Backup.objects.get(id=self.backup_id)
        except:
            self.log_error("Error find backup whit ID")
        try:
            with open(app_list_file, encoding="utf-8") as f:
                try:
                    data = json.load(f)
                    apps = data.get("Apks", [])
                    total_apps = len(apps)
                    self.log_info(f"Found {total_apps} applications in file")
                    self.update_progress(
                        step_number,
                        step_name,
                        f"Found {total_apps} apps, starting extraction",
                        5,
                    )

                    for i, app in enumerate(apps):
                        name = app.get("ApkName")
                        package_name = app.get("ApkPkgName")
                        version_name = app.get("VersionName")

                        if not name or not package_name:
                            continue

                        icon_path = None
                        icon_file = None
                        icons_dir = self._get_file_path("APKFILE", "AppList_ext")
                        possible_icon_paths = [
                            icons_dir / f"{package_name}.png",
                            icons_dir / f"{package_name}.jpg",
                            icons_dir / package_name / "icon.png",
                            icons_dir / package_name / "icon.jpg",
                        ]

                        for icon_file_path in possible_icon_paths:
                            if icon_file_path.exists():
                                icon_path = str(icon_file_path)
                                try:
                                    icon_file = open(icon_file_path, "rb")
                                except Exception as e:
                                    self.log_error(
                                        f"Error opening icon file {icon_file_path}: {str(e)}"
                                    )
                                    icon_file = None
                                break

                        try:
                            last_time_used = (
                                datetime.fromtimestamp(
                                    app.get("LastTimeUsed", 0) / 1000
                                )
                                if app.get("LastTimeUsed")
                                else None
                            )
                        except (ValueError, TypeError):
                            last_time_used = None

                        new_app = ApkList.objects.create(
                            backup_id=self.backup_id,
                            apk_name=name,
                            version_name=version_name,
                            size=app.get("Size"),
                            last_time_used=last_time_used,
                            recent_used=app.get("RecentUsed", False),
                        )

                        if icon_file:
                            try:
                                icon_filename = os.path.basename(icon_path)
                                django_file = DjangoFile(icon_file)
                                new_app.icon.save(icon_filename, django_file, save=True)
                                icon_file.close()
                                self.log_info(f"Saved icon for {package_name}")
                            except Exception as e:
                                self.log_error(
                                    f"Error saving icon for {package_name}: {str(e)}"
                                )

                        app_count += 1

                        if (
                            "RuntimePermissions" in app
                            and app.get("RuntimePermissions")
                            and isinstance(app.get("RuntimePermissions"), list)
                        ):
                            for permission in app.get("RuntimePermissions"):
                                perm_name = permission.get("name")
                                if perm_name:
                                    ApkPermission.objects.create(
                                        apk_id=new_app.id,
                                        backup_id=self.backup_id,
                                        permission_name=perm_name,
                                        permission_group=permission.get("group"),
                                        status=permission.get("status"),
                                        flags=permission.get("flags"),
                                        protection_level=permission.get(
                                            "protection_level"
                                        ),
                                    )

                        if (i % 5 == 0) or (i == total_apps - 1):
                            progress = min(int((i / total_apps) * 90) + 5, 95)
                            self.update_progress(
                                step_number,
                                step_name,
                                f"Processing apps ({i+1}/{total_apps})",
                                progress,
                            )

                        if app_count % 20 == 0:
                            self.log_info(f"Processed {app_count} applications")

                    self.log_info(f"Successfully imported {app_count} applications")
                    self.update_progress(
                        step_number,
                        step_name,
                        f"Successfully extracted {app_count} applications",
                        100,
                        "completed",
                    )

                    return app_count

                except json.JSONDecodeError as e:
                    error_msg = f"Error decoding JSON: {str(e)}"
                    self.log_error(error_msg)
                    self.update_progress(step_number, step_name, error_msg, 0, "failed")
                    raise
        except Exception as e:
            error_msg = f"Unexpected error processing applications: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, "failed")
            raise
