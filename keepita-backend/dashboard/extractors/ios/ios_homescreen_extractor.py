
import json
import logging
from pathlib import Path
from typing import Optional

from django.db import transaction

from ...models import HomeScreenItem
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class IOSHomeScreenExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 18
        step_name = 'homescreen'
        
        self.log_info(f"[Backup {self.backup_id}] Starting iOS homescreen import from server data.")
        self.update_progress(step_number, step_name, 'Starting homescreen import', 0)
        
        json_data = self._load_server_json('homescreen')
        if json_data:
            return self._import_homescreen_from_json(json_data, step_number, step_name)
        
        self.log_warning("No homescreen data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_homescreen_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing homescreen from server JSON data.")
        items = json_data.get('items', [])
        total_items = len(items)
        self.update_progress(step_number, step_name, f'Found {total_items} items from server', 10)

        with transaction.atomic():
            HomeScreenItem.objects.filter(backup_id=self.backup_id).delete()
            
            item_count = 0
            for item_data in items:
                try:
                    name = item_data.get('name', item_data.get('display_name', ''))
                    package_name = item_data.get('package_name', item_data.get('bundle_id', ''))
                    item_type = item_data.get('type', 'app')
                    page = item_data.get('page', 0)
                    position = item_data.get('position', 0)
                    
                    HomeScreenItem.objects.create(
                        backup_id=self.backup_id,
                        name=name,
                        package_name=package_name,
                        item_type=item_type,
                        page=page,
                        position=position
                    )
                    item_count += 1
                    
                except Exception as e:
                    self.log_error(f"Error importing homescreen item: {e}")

        self.log_info(f"Successfully imported {item_count} homescreen items.")
        self.update_progress(step_number, step_name, f"Successfully imported {item_count} items", 100, 'completed')
        return item_count

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