
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from django.db import transaction
from django.utils import timezone

from ...models import BrowserBookmark, BrowserHistory
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class IOSSafariExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 13
        step_name = 'safari'
        
        self.log_info(f"[Backup {self.backup_id}] Starting iOS Safari import from server data.")
        self.update_progress(step_number, step_name, 'Starting Safari import', 0)
        
        history_count = 0
        bookmark_count = 0
        
        history_data = self._load_server_json('browser')
        if history_data:
            history_count = self._import_history_from_json(history_data)
        
        bookmark_data = self._load_server_json('bookmarks')
        if bookmark_data:
            bookmark_count = self._import_bookmarks_from_json(bookmark_data)
        
        total = history_count + bookmark_count
        if total == 0:
            self.log_warning("No Safari data from server. Skipping.")
        
        self.update_progress(step_number, step_name, f'Imported {history_count} history, {bookmark_count} bookmarks', 100, 'completed')
        return total

    def _import_history_from_json(self, json_data: dict) -> int:
        items = json_data.get('items', [])
        self.log_info(f"Importing {len(items)} browser history items from server.")

        with transaction.atomic():
            BrowserHistory.objects.filter(backup_id=self.backup_id).delete()
            
            count = 0
            for item in items:
                try:
                    url = item.get('url', '')
                    title = item.get('title', '')
                    visit_count = item.get('visit_count', 1)
                    last_visit = self._parse_date(item.get('last_visit_time', item.get('visit_time')))
                    
                    BrowserHistory.objects.create(
                        backup_id=self.backup_id,
                        url=url,
                        title=title,
                        visit_count=visit_count,
                        typed_count=0,
                        last_visit_time=last_visit or timezone.now(),
                        hidden=False,
                        source='ios_safari_server'
                    )
                    count += 1
                except Exception as e:
                    self.log_error(f"Error importing history: {e}")

        return count

    def _import_bookmarks_from_json(self, json_data: dict) -> int:
        items = json_data.get('items', [])
        self.log_info(f"Importing {len(items)} bookmarks from server.")

        with transaction.atomic():
            BrowserBookmark.objects.filter(backup_id=self.backup_id).delete()
            
            count = 0
            for item in items:
                try:
                    url = item.get('url', '')
                    title = item.get('title', '')
                    folder = item.get('folder', '')
                    
                    BrowserBookmark.objects.create(
                        backup_id=self.backup_id,
                        url=url,
                        title=title,
                        folder=folder
                    )
                    count += 1
                except Exception as e:
                    self.log_error(f"Error importing bookmark: {e}")

        return count

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