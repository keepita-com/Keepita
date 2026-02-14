
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from django.db import transaction

from ...models import CalendarEvent
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class IOSCalendarExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 10
        step_name = 'calendar'
        
        self.log_info(f"[Backup {self.backup_id}] Starting iOS calendar import from server data.")
        self.update_progress(step_number, step_name, 'Starting calendar import', 0)
        
        json_data = self._load_server_json('calendar')
        if json_data:
            return self._import_calendar_from_json(json_data, step_number, step_name)
        
        self.log_warning("No calendar data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_calendar_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing calendar from server JSON data.")
        items = json_data.get('items', [])
        total_events = len(items)
        self.update_progress(step_number, step_name, f'Found {total_events} events from server', 10)

        with transaction.atomic():
            CalendarEvent.objects.filter(backup_id=self.backup_id).delete()
            
            event_count = 0
            for event_data in items:
                try:
                    title = event_data.get('title', event_data.get('summary', ''))
                    description = event_data.get('description', event_data.get('notes', ''))
                    location = event_data.get('location', '')
                    start_date = self._parse_date(event_data.get('start_date', event_data.get('start')))
                    end_date = self._parse_date(event_data.get('end_date', event_data.get('end')))
                    all_day = event_data.get('all_day', False)
                    
                    CalendarEvent.objects.create(
                        backup_id=self.backup_id,
                        title=title,
                        description=description,
                        location=location,
                        start_date=start_date,
                        end_date=end_date,
                        all_day=all_day
                    )
                    event_count += 1
                    
                except Exception as e:
                    self.log_error(f"Error importing calendar event: {e}")

        self.log_info(f"Successfully imported {event_count} calendar events.")
        self.update_progress(step_number, step_name, f"Successfully imported {event_count} events", 100, 'completed')
        return event_count

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