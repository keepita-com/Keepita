
import json
import logging
from pathlib import Path
from typing import Optional

from ...models import Backup, WifiNetwork
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class XiaomiWifiExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 11
        step_name = 'wifi'

        self.log_info("[Backup] Starting Xiaomi Wi-Fi import from server data")
        self.update_progress(step_number, step_name, 'Starting Wi-Fi import', 0)

        json_data = self._load_server_json('wifi')
        if json_data:
            return self._import_wifi_from_json(json_data, step_number, step_name)

        self.log_warning("No WiFi data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_wifi_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing WiFi networks from server JSON data.")
        items = json_data.get('items', [])
        total_networks = len(items)
        self.update_progress(step_number, step_name, f'Found {total_networks} networks from server', 10)

        try:
            backup_instance = Backup.objects.get(pk=self.backup_id)
            WifiNetwork.objects.filter(backup=backup_instance).delete()

            network_count = 0
            for network_data in items:
                WifiNetwork.objects.create(
                    backup=backup_instance,
                    ssid=network_data.get("ssid", network_data.get("SSID", "")),
                    password=network_data.get("password", network_data.get("psk")),
                    security_type=network_data.get("security_type", "OTHER"),
                    hidden=network_data.get("hidden", False),
                )
                network_count += 1

            self.log_info(f"Successfully imported {network_count} Wi-Fi networks from server.")
            self.update_progress(step_number, step_name, f"Successfully imported {network_count} networks", 100, 'completed')
            return network_count

        except Exception as e:
            error_msg = f"Failed to import WiFi networks from JSON: {e}"
            self.log_error(error_msg, exc_info=True)
            self.update_progress(step_number, step_name, error_msg, 0, 'failed')
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