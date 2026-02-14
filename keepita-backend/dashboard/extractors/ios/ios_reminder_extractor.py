
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from django.db import transaction

from ...models import Reminder
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class IOSReminderExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 16
        step_name = 'reminders'
        
        self.log_info(f"[Backup {self.backup_id}] Starting iOS reminders import from server data.")
        self.update_progress(step_number, step_name, 'Starting reminders import', 0)
        
        json_data = self._load_server_json('reminders')
        if json_data:
            return self._import_reminders_from_json(json_data, step_number, step_name)
        
        self.log_warning("No reminders data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_reminders_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing reminders from server JSON data.")
        items = json_data.get('items', [])
        total_reminders = len(items)
        self.update_progress(step_number, step_name, f'Found {total_reminders} reminders from server', 10)

        with transaction.atomic():
            Reminder.objects.filter(backup_id=self.backup_id).delete()
            
            reminder_count = 0
            for reminder_data in items:
                try:
                    title = reminder_data.get('title', '')
                    notes = reminder_data.get('notes', reminder_data.get('body', ''))
                    due_date = self._parse_date(reminder_data.get('due_date', reminder_data.get('due')))
                    completed = reminder_data.get('completed', reminder_data.get('is_completed', False))
                    priority = reminder_data.get('priority', 0)
                    
                    Reminder.objects.create(
                        backup_id=self.backup_id,
                        title=title,
                        notes=notes,
                        due_date=due_date,
                        completed=bool(completed),
                        priority=int(priority) if priority else 0
                    )
                    reminder_count += 1
                    
                except Exception as e:
                    self.log_error(f"Error importing reminder: {e}")

        self.log_info(f"Successfully imported {reminder_count} reminders.")
        self.update_progress(step_number, step_name, f"Successfully imported {reminder_count} reminders", 100, 'completed')
        return reminder_count

    def _parse_date(self, date_val) -> Optional[datetime]:
        if not date_val:
            return None
        try:
            if isinstance(date_val, (int, float)):
                if date_val < 1e9:
                    from datetime import timedelta
                    return datetime(2001, 1, 1) + timedelta(seconds=date_val)
                return datetime.fromtimestamp(date_val / 1000 if date_val > 1e12 else date_val)
            else:
                return datetime.fromisoformat(str(date_val).replace('Z', '+00:00'))
        except:
            return None

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