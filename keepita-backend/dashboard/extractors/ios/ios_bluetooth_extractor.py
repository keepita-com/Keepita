
import json
import logging
from pathlib import Path
from typing import Optional

from django.db import transaction

from ...models import BluetoothDevice
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class IOSBluetoothExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 17
        step_name = 'bluetooth'
        
        self.log_info(f"[Backup {self.backup_id}] Starting iOS bluetooth import from server data.")
        self.update_progress(step_number, step_name, 'Starting bluetooth import', 0)
        
        json_data = self._load_server_json('bluetooth')
        if json_data:
            return self._import_bluetooth_from_json(json_data, step_number, step_name)
        
        self.log_warning("No bluetooth data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_bluetooth_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing bluetooth from server JSON data.")
        items = json_data.get('items', [])
        total_devices = len(items)
        self.update_progress(step_number, step_name, f'Found {total_devices} devices from server', 10)

        with transaction.atomic():
            BluetoothDevice.objects.filter(backup_id=self.backup_id).delete()
            
            device_count = 0
            for device_data in items:
                try:
                    name = device_data.get('name', device_data.get('device_name', ''))
                    address = device_data.get('address', device_data.get('mac_address', ''))
                    device_class = device_data.get('device_class', device_data.get('type', ''))
                    
                    device_class_int = None
                    if device_class:
                        try:
                            device_class_int = int(device_class)
                        except (ValueError, TypeError):
                            device_class_int = None
                    
                    BluetoothDevice.objects.create(
                        backup_id=self.backup_id,
                        name=name if name else 'Unknown Device',
                        address=address,
                        device_class=device_class_int
                    )
                    device_count += 1
                    
                except Exception as e:
                    self.log_error(f"Error importing bluetooth device: {e}")

        self.log_info(f"Successfully imported {device_count} bluetooth devices.")
        self.update_progress(step_number, step_name, f"Successfully imported {device_count} devices", 100, 'completed')
        return device_count

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
