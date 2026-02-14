
import json
import logging
from pathlib import Path
from typing import Optional

from django.db import transaction

from ...models import Wallpaper
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class IOSWallpaperExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 20
        step_name = 'wallpapers'
        
        self.log_info(f"[Backup {self.backup_id}] Starting iOS wallpapers import from server data.")
        self.update_progress(step_number, step_name, 'Starting wallpapers import', 0)
        
        json_data = self._load_server_json('wallpapers')
        if json_data:
            return self._import_wallpapers_from_json(json_data, step_number, step_name)
        
        self.log_warning("No wallpapers data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_wallpapers_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing wallpapers from server JSON data.")
        items = json_data.get('items', [])
        total_items = len(items)
        self.update_progress(step_number, step_name, f'Found {total_items} wallpapers from server', 10)

        with transaction.atomic():
            Wallpaper.objects.filter(backup_id=self.backup_id).delete()
            
            wallpaper_count = 0
            for wallpaper_data in items:
                try:
                    name = wallpaper_data.get('name', wallpaper_data.get('filename', ''))
                    wallpaper_type = wallpaper_data.get('type', 'unknown')
                    
                    Wallpaper.objects.create(
                        backup_id=self.backup_id,
                        name=name,
                        wallpaper_type=wallpaper_type
                    )
                    wallpaper_count += 1
                    
                except Exception as e:
                    self.log_error(f"Error importing wallpaper: {e}")

        self.log_info(f"Successfully imported {wallpaper_count} wallpapers.")
        self.update_progress(step_number, step_name, f"Successfully imported {wallpaper_count} wallpapers", 100, 'completed')
        return wallpaper_count

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
