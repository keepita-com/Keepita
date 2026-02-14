
import json
import logging
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

from django.utils import timezone

from ...models import BrowserDownload, BrowserHistory
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class XiaomiBrowserExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 13
        step_name = 'browser'

        self.log_info("Starting Xiaomi browser data import from server...")
        self.update_progress(step_number, step_name, 'Starting browser data import', 0)

        json_data = self._load_server_json('browser')
        if json_data:
            total_count = self._import_browser_from_json(json_data, step_number, step_name)
        else:
            self.log_warning("No browser data from server. Skipping.")
            total_count = 0

        self.update_progress(step_number, step_name, f'Successfully imported {total_count} browser items', 100, 'completed')
        self.log_info(f"Successfully imported {total_count} browser items from server")
        self.extracted_count = total_count

        return total_count

    def _import_browser_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing browser data from server JSON.")
        items = json_data.get('items', [])
        total_items = len(items)
        self.update_progress(step_number, step_name, f'Found {total_items} browser items from server', 10)

        history_count = 0
        download_count = 0

        for i, item in enumerate(items):
            try:
                item_type = item.get('type', 'history')

                if item_type == 'download':
                    BrowserDownload.objects.create(
                        backup_id=self.backup_id,
                        url=item.get('url', ''),
                        file_name=item.get('file_name', ''),
                        file_path=item.get('file_path', ''),
                        file=None,
                        download_time=timezone.now(),
                        bytes_downloaded=item.get('size', 0),
                        state='complete',
                        tab_url=None
                    )
                    download_count += 1
                else:
                    url = item.get('url', '')
                    title = item.get('title', '')
                    if not title:
                        try:
                            domain = urlparse(url).netloc
                            title = domain[4:] if domain.startswith('www.') else domain
                        except:
                            title = ''

                    BrowserHistory.objects.create(
                        backup_id=self.backup_id,
                        url=url,
                        title=title,
                        visit_count=item.get('visit_count', 1),
                        typed_count=0,
                        last_visit_time=timezone.now(),
                        hidden=False,
                        source='xiaomi_browser_server'
                    )
                    history_count += 1

                if (i + 1) % 20 == 0:
                    progress = min(10 + int(((i + 1) / total_items) * 85), 95)
                    self.update_progress(step_number, step_name, f"Importing browser data ({i+1}/{total_items})", progress)

            except Exception as e:
                self.log_error(f"Error importing browser item: {e}")

        self.log_info(f"Successfully imported {history_count} history + {download_count} downloads from server.")
        return history_count + download_count

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