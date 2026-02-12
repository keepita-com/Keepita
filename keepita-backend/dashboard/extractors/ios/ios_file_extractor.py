
import json
import logging
from pathlib import Path
from typing import Optional

from django.db import transaction

from ...models import File
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class IOSFileExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 12
        step_name = 'files'
        
        self.log_info(f"[Backup {self.backup_id}] Starting iOS files import from server data.")
        self.update_progress(step_number, step_name, 'Starting files import', 0)
        
        json_data = self._load_server_json('files')
        if json_data:
            return self._import_files_from_json(json_data, step_number, step_name)
        
        self.log_warning("No files data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_files_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing files from server JSON data.")
        items = json_data.get('items', [])
        total_files = len(items)
        self.update_progress(step_number, step_name, f'Found {total_files} files from server', 10)

        with transaction.atomic():
            File.objects.filter(backup_id=self.backup_id).delete()
            
            file_count = 0
            for file_data in items:
                try:
                    file_name = file_data.get('file_name', file_data.get('name', ''))
                    file_size = file_data.get('file_size', file_data.get('size', 0))
                    file_extension = file_data.get('file_extension', file_data.get('extension', ''))
                    mime_type = file_data.get('mime_type', 'application/octet-stream')
                    category = file_data.get('category', 'unknown')
                    
                    File.objects.create(
                        backup_id=self.backup_id,
                        file_name=file_name,
                        file_size=file_size,
                        file_extension=file_extension,
                        mime_type=mime_type,
                        category=category
                    )
                    file_count += 1
                    
                except Exception as e:
                    self.log_error(f"Error importing file: {e}")

        self.log_info(f"Successfully imported {file_count} files.")
        self.update_progress(step_number, step_name, f"Successfully imported {file_count} files", 100, 'completed')
        return file_count

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
