
import json
import logging
from datetime import time
from pathlib import Path
from typing import Optional

from ...models import Alarm
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class XiaomiAlarmExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 14
        step_name = 'alarms'

        json_data = self._load_server_json('alarms')
        if json_data:
            return self._import_alarms_from_json(json_data, step_number, step_name)

        self.log_warning("No alarm data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_alarms_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing alarms from server JSON data.")
        items = json_data.get('items', [])
        total_alarms = len(items)
        self.update_progress(step_number, step_name, f'Found {total_alarms} alarms from server', 10)

        Alarm.objects.filter(backup_id=self.backup_id).delete()

        alarm_count = 0
        for alarm_data in items:
            try:
                hour = int(alarm_data.get('hour', 0))
                minute = int(alarm_data.get('minute', alarm_data.get('minutes', 0)))
                alarm_time = time(hour=hour, minute=minute)
                active = alarm_data.get('active', alarm_data.get('enabled', False))
                if isinstance(active, str):
                    active = active.lower() in ('1', 'true', 'yes')
                label = alarm_data.get('name', alarm_data.get('label', alarm_data.get('message')))
                repeat_type = alarm_data.get('repeat_type', alarm_data.get('daysofweek', 0))

                Alarm.objects.create(
                    backup_id=self.backup_id,
                    name=label,
                    time=alarm_time,
                    active=bool(active),
                    repeat_type=int(repeat_type) if repeat_type else 0
                )
                alarm_count += 1
            except Exception as e:
                self.log_error(f"Error importing alarm: {e}")

        self.log_info(f"Successfully imported {alarm_count} alarms from server.")
        self.extracted_count = alarm_count
        self.update_progress(step_number, step_name, f"Successfully imported {alarm_count} alarms", 100, 'completed')
        return alarm_count

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
