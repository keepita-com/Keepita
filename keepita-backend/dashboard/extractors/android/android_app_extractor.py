import logging
import tempfile
from pathlib import Path

from androguard.core.bytecodes.apk import APK

from ..base_extractor import BaseExtractor
from ...models import ApkList, ApkPermission

logger = logging.getLogger(__name__)

class AndroidAppExtractor(BaseExtractor):

    def extract(self) -> int:
        self.log_info("Starting Android application (APK) extraction.")
        step_number, step_name = 9, 'apps'
        self.update_progress(step_number, step_name, 'Scanning for APK files...', 5)

        apk_dir = self.backup_root / "others"
        if not apk_dir.is_dir():
            self.log_warning("APK directory ('others') not found. Skipping app extraction.")
            self.update_progress(step_number, step_name, 'APK directory not found.', 100, 'completed')
            return 0

        apk_files = list(apk_dir.glob("*.apk"))
        total_apks = len(apk_files)
        if total_apks == 0:
            self.log_info("No APK files found.")
            self.update_progress(step_number, step_name, 'No APK files found.', 100, 'completed')
            return 0

        self.log_info(f"Found {total_apks} APK files to process.")
        
        parsed_count = 0
        ApkList.objects.filter(backup_id=self.backup_id).delete()
        
        for i, apk_path in enumerate(apk_files):
            try:
                apk = APK(str(apk_path))
                package_name = apk.get_package()
                if not package_name:
                    self.log_warning(f"Skipping {apk_path.name}: package name is blank.")
                    continue

                new_app = ApkList.objects.create(
                    backup_id=self.backup_id,
                    apk_name=apk.get_app_name() or package_name,
                    version_name=apk.get_androidversion_name(),
                    size=apk_path.stat().st_size
                )
                
                permissions = apk.get_permissions()
                perms_to_create = [
                    ApkPermission(backup_id=self.backup_id, apk=new_app, permission_name=p)
                    for p in permissions
                ]
                if perms_to_create:
                    ApkPermission.objects.bulk_create(perms_to_create)
                
                parsed_count += 1

                progress = min(10 + int(((i + 1) / total_apks) * 85), 95)
                self.update_progress(step_number, step_name, f"Processing APKs ({i+1}/{total_apks})", progress)

            except Exception as e:
                self.log_error(f"Failed to parse APK {apk_path.name}: {e}")
                continue

        self.log_info(f"Successfully imported {parsed_count} Android applications.")
        self.update_progress(step_number, step_name, f'Successfully extracted {parsed_count} apps', 100, 'completed')
        return parsed_count