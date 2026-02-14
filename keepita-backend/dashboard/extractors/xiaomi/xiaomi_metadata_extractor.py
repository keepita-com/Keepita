
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from ...models import BackupMetadata
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class XiaomiMetadataExtractor(BaseExtractor):

    def extract(self):
        step_number = 1
        step_name = 'metadata'
        self.update_progress(step_number, step_name, 'Starting metadata import', 0)

        json_data = self._load_server_json('metadata')
        if json_data:
            return self._import_metadata_from_json(json_data, step_number, step_name)

        self.log_warning("No metadata from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_metadata_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing metadata from server JSON data.")
        items = json_data.get('items', [json_data])
        
        if not items:
            self.update_progress(step_number, step_name, 'No metadata in server response', 0, 'failed')
            return 0

        metadata = items[0] if isinstance(items, list) else items

        try:
            backup_date = None
            date_val = metadata.get('backup_date', metadata.get('date'))
            if date_val:
                try:
                    if isinstance(date_val, (int, float)):
                        backup_date = datetime.fromtimestamp(date_val / 1000 if date_val > 1e12 else date_val)
                    else:
                        backup_date = datetime.fromisoformat(str(date_val))
                except:
                    pass

            BackupMetadata.objects.update_or_create(
                backup_id=self.backup_id,
                defaults={
                    'device_name': metadata.get('device_name', metadata.get('device')),
                    'miui_version': metadata.get('miui_version'),
                    'backup_version': metadata.get('backup_version', metadata.get('bak_version')),
                    'is_auto_backup': metadata.get('is_auto_backup', metadata.get('auto_backup')),
                    'backup_date': backup_date,
                    'backup_size': metadata.get('backup_size', metadata.get('size')),
                    'storage_left': metadata.get('storage_left'),
                }
            )

            self.update_progress(step_number, step_name, 'Successfully imported metadata from server', 100, 'completed')
            return 1

        except Exception as e:
            self.log_error(f"Error importing metadata from JSON: {e}")
            self.update_progress(step_number, step_name, 'Failed to import metadata', 0, 'failed')
            return 0

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