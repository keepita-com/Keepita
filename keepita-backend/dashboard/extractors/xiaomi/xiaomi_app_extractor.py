
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from ...models import ApkList, ApkPermission, Backup
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class XiaomiAppExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 9
        step_name = 'apps'
        self.log_info("Starting Xiaomi application import from server data.")
        
        ApkList.objects.filter(backup_id=self.backup_id).delete()
        ApkPermission.objects.filter(backup_id=self.backup_id).delete()

        json_data = self._load_server_json('apps')
        if json_data:
            return self._import_apps_from_json(json_data, step_number, step_name)

        self.log_warning("No app data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_apps_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing apps from server JSON data.")
        items = json_data.get('items', [])
        total_apps = len(items)
        self.update_progress(step_number, step_name, f'Found {total_apps} apps from server', 5)

        app_count = 0
        for i, app in enumerate(items):
            try:
                name = app.get('apk_name', app.get('name', "Unknown App"))
                package_name = app.get('package_name', f"unknown.app.{i}")
                version_name = app.get('version_name', app.get('version'))
                
                combined_name = f"{name} ({package_name})"
                
                last_time_used = None
                if app.get('last_time_used'):
                    try:
                        ltu = app['last_time_used']
                        if isinstance(ltu, (int, float)):
                            last_time_used = datetime.fromtimestamp(ltu / 1000 if ltu > 1e12 else ltu)
                        else:
                            last_time_used = datetime.fromisoformat(str(ltu))
                    except:
                        pass
                
                ApkList.objects.create(
                    backup_id=self.backup_id,
                    apk_name=combined_name,
                    version_name=version_name,
                    size=app.get('size', 0),
                    last_time_used=last_time_used,
                    recent_used=app.get('recent_used', False)
                )
                app_count += 1

                if (i + 1) % 10 == 0:
                    progress = min(int(((i + 1) / total_apps) * 90) + 5, 95)
                    self.update_progress(step_number, step_name, f"Importing apps ({i+1}/{total_apps})", progress)

            except Exception as e:
                self.log_error(f"Error importing app: {e}")

        self.log_info(f"Successfully imported {app_count} apps from server.")
        self.update_progress(step_number, step_name, f"Successfully imported {app_count} applications", 100, 'completed')
        return app_count

    def _load_server_json(self, data_type: str) -> Optional[dict]:
        json_path = Path(self.backup_root) / '_extracted_json' / f'{data_type}.json'
        if json_path.exists():
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.log_info(f"Loaded {data_type} data from server JSON: {data.get('count', 0)} items")
                    return data
            except Exception as e:
                self.log_error(f"Failed to load server JSON for {data_type}: {e}")
        return None