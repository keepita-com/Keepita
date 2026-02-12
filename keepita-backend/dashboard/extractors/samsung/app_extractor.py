import json
import logging
from datetime import datetime
from pathlib import Path

from ...models import ApkList, ApkPermission
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class AppExtractor(BaseExtractor):
    
    def extract(self) -> int:
        step_number = 9
        step_name = 'apps'
        
        app_list_file = self._get_file_path('APKFILE', 'AppList_ext', 'AppList.json')
        self.log_info(f"Extracting applications from: {app_list_file}")
        
        if not app_list_file.exists():
            self.update_progress(step_number, step_name, 'AppList.json not found', 100, 'completed')
            self.log_debug(f"AppList.json not found at: {app_list_file}")
            return 0
        
        self.update_progress(step_number, step_name, 'Parsing application list...', 10)
        
        try:
            with open(app_list_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            if not content.strip():
                self.log_warning("AppList.json is empty")
                self.update_progress(step_number, step_name, 'AppList.json is empty', 100, 'completed')
                return 0
            
            try:
                data = json.loads(content)
            except json.JSONDecodeError as e:
                self.log_error(f"Failed to parse AppList.json: {e}")
                self.update_progress(step_number, step_name, 'Failed to parse AppList.json', 0, 'failed')
                return 0
            
            if isinstance(data, dict):
                apps_list = data.get('Apks', data.get('AppList', data.get('apps', data.get('applications', []))))
            elif isinstance(data, list):
                apps_list = data
            else:
                apps_list = []
            
            total_apps = len(apps_list)
            self.log_info(f"Found {total_apps} applications")
            
            if total_apps == 0:
                self.update_progress(step_number, step_name, 'No applications found', 100, 'completed')
                return 0
            
            self.update_progress(step_number, step_name, f'Processing {total_apps} applications...', 30)
            
            ApkList.objects.filter(backup_id=self.backup_id).delete()
            
            app_count = 0
            for i, app in enumerate(apps_list):
                try:
                    apk_name = app.get('ApkName', app.get('name', app.get('appName', app.get('label', ''))))
                    
                    if not apk_name:
                        pkg_name = app.get('ApkPkgName', app.get('packageName', app.get('package', '')))
                        if pkg_name:
                            apk_name = pkg_name.split('.')[-1].capitalize()
                        else:
                            continue
                    
                    version = app.get('VersionName', app.get('version', app.get('versionName', '')))
                    
                    size = None
                    size_val = app.get('Size', app.get('size', app.get('appSize')))
                    if size_val:
                        try:
                            size = int(size_val)
                        except (ValueError, TypeError):
                            pass
                    
                    last_time_used = None
                    last_used_val = app.get('LastTimeUsed', app.get('lastUsed', app.get('lastTimeUsed')))
                    if last_used_val:
                        try:
                            timestamp = int(last_used_val)
                            if timestamp > 10000000000:
                                timestamp = timestamp / 1000
                            last_time_used = datetime.fromtimestamp(timestamp)
                        except (ValueError, TypeError, OSError):
                            pass
                    
                    recent_used = app.get('RecentUsed', app.get('recentUsed', False))
                    if isinstance(recent_used, str):
                        recent_used = recent_used.lower() == 'true'
                    
                    apk_obj = ApkList.objects.create(
                        backup_id=self.backup_id,
                        apk_name=apk_name[:255],
                        version_name=version[:100] if version else None,
                        size=size,
                        last_time_used=last_time_used,
                        recent_used=bool(recent_used)
                    )
                    
                    permissions = app.get('RuntimePermissions', app.get('permissions', []))
                    for perm in permissions:
                        if isinstance(perm, dict):
                            perm_name = perm.get('name', '')
                            perm_group = perm.get('group', '')
                            status = perm.get('status')
                            flags = perm.get('flags')
                            protection_level = perm.get('protection_level')
                        else:
                            perm_name = str(perm)
                            perm_group = ''
                            status = None
                            flags = None
                            protection_level = None
                        
                        if perm_name:
                            ApkPermission.objects.create(
                                apk=apk_obj,
                                backup_id=self.backup_id,
                                permission_name=perm_name[:255],
                                permission_group=perm_group[:255] if perm_group else None,
                                status=status,
                                flags=flags,
                                protection_level=protection_level
                            )
                    
                    app_count += 1
                    
                    if i % 10 == 0 or i == total_apps - 1:
                        progress = 30 + int((i / max(total_apps, 1)) * 65)
                        self.update_progress(step_number, step_name, f'Saving apps ({i+1}/{total_apps})', progress)
                    
                except Exception as e:
                    self.log_error(f"Error saving app: {str(e)}")
                    continue
            
            self.log_info(f"Successfully imported {app_count} applications")
            self.update_progress(step_number, step_name, f'Successfully extracted {app_count} applications', 100, 'completed')
            
            return app_count
            
        except Exception as e:
            error_msg = f"Error processing applications: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, 'failed')
            return 0
