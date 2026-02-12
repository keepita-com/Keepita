
import json
import logging
from pathlib import Path
from typing import Optional

from django.db import transaction

from ...models import Note
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class XiaomiNoteExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number, step_name = 15, 'notes'

        json_data = self._load_server_json('notes')
        if json_data:
            return self._import_notes_from_json(json_data, step_number, step_name)

        self.log_warning("No notes data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_notes_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing notes from server JSON data.")
        items = json_data.get('items', [])
        total_notes = len(items)
        self.update_progress(step_number, step_name, f'Found {total_notes} notes from server', 10)

        with transaction.atomic():
            Note.objects.filter(backup_id=self.backup_id).delete()
            
            note_count = 0
            for note_data in items:
                Note.objects.create(
                    backup_id=self.backup_id,
                    note_id=note_data.get('note_id'),
                    title=note_data.get('title'),
                    body=note_data.get('body', note_data.get('content', ''))
                )
                note_count += 1

        self.log_info(f"Successfully imported {note_count} notes from server.")
        self.update_progress(step_number, step_name, f"Successfully imported {note_count} notes", 100, 'completed')
        return note_count

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