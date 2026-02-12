
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from django.db import transaction

from ...models import Notification
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class IOSNotificationExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 19
        step_name = 'notifications'
        
        self.log_info(f"[Backup {self.backup_id}] Starting iOS notifications import from server data.")
        self.update_progress(step_number, step_name, 'Starting notifications import', 0)
        
        json_data = self._load_server_json('notifications')
        if json_data:
            return self._import_notifications_from_json(json_data, step_number, step_name)
        
        self.log_warning("No notifications data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_notifications_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing notifications from server JSON data.")
        items = json_data.get('items', [])
        total_items = len(items)
        self.update_progress(step_number, step_name, f'Found {total_items} notifications from server', 10)

        with transaction.atomic():
            Notification.objects.filter(backup_id=self.backup_id).delete()
            
            notif_count = 0
            for notif_data in items:
                try:
                    app_name = notif_data.get('app_name', notif_data.get('bundle_id', ''))
                    title = notif_data.get('title', '')
                    body = notif_data.get('body', notif_data.get('message', ''))
                    timestamp = self._parse_date(notif_data.get('timestamp', notif_data.get('date')))
                    
                    Notification.objects.create(
                        backup_id=self.backup_id,
                        app_name=app_name,
                        title=title,
                        body=body,
                        timestamp=timestamp or datetime.now()
                    )
                    notif_count += 1
                    
                except Exception as e:
                    self.log_error(f"Error importing notification: {e}")

        self.log_info(f"Successfully imported {notif_count} notifications.")
        self.update_progress(step_number, step_name, f"Successfully imported {notif_count} notifications", 100, 'completed')
        return notif_count

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