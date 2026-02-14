import logging
import os
import shutil
from pathlib import Path

from django.core.files import File as DjangoFile
from django.db import transaction

from ...models import Backup, Wallpaper
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class WallpaperExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 17
        step_name = 'wallpapers'
        
        self.log_info("Processing wallpapers...")
        self.update_progress(step_number, step_name, 'Starting wallpaper extraction', 0)

        wallpaper_paths = [
            self._get_file_path('WALLPAPER', 'WALLPAPER_ext', 'wallpaper', 'wallpaper.png'),
            self._get_file_path('WALLPAPER', 'WALLPAPER_ext', 'wallpaper', 'lock_wallpaper.png'),
            self._get_file_path('WALLPAPER', 'WALLPAPER_ext', 'wallpaper.png'),
            self._get_file_path('WALLPAPER', 'WALLPAPER_ext', 'lock_wallpaper.png')
        ]

        self.update_progress(step_number, step_name, 'Searching for wallpaper files', 20)

        wallpaper_count = 0
        total_paths = len(wallpaper_paths)

        with transaction.atomic():
            for idx, path in enumerate(wallpaper_paths):
                progress = 30 + (idx * 60 // total_paths)
                self.update_progress(
                    step_number, 
                    step_name, 
                    f'Checking wallpaper path: {path.name}', 
                    progress
                )

                if path.exists() and path.is_file():
                    try:
                        wallpaper_type = 'lock' if 'lock' in path.name.lower() else 'home'
                        
                        existing_wallpaper = Wallpaper.objects.filter(
                            backup_id=self.backup_id,
                            original_path=str(path)
                        ).first()
                        
                        if existing_wallpaper:
                            self.log_info(f"Wallpaper already exists: {path.name}")
                            continue

                        wallpaper = Wallpaper(
                            backup_id=self.backup_id,
                            type=wallpaper_type,
                            original_path=str(path),
                            is_default=False
                        )
                        
                        with open(path, 'rb') as image_file:
                            backup = Backup.objects.get(id=self.backup_id)
                            original_filename = path.name
                            django_file = DjangoFile(image_file, name=original_filename)
                            wallpaper.image.save(original_filename, django_file, save=False)
                        
                        wallpaper.save()
                        
                        wallpaper_count += 1
                        self.log_info(f"Saved {wallpaper_type} wallpaper: {path.name}")
                        
                    except Exception as e:
                        self.log_error(f"Error processing wallpaper {path}: {e}")
                        continue
                else:
                    self.log_debug(f"Wallpaper file not found: {path}")

        if wallpaper_count > 0:
            self.update_progress(
                step_number, 
                step_name, 
                f'Successfully extracted {wallpaper_count} wallpapers', 
                100, 
                'completed'
            )
            self.log_info(f"Successfully imported {wallpaper_count} wallpapers")
        else:
            self.update_progress(
                step_number, 
                step_name, 
                'No wallpapers found', 
                100, 
                'completed'
            )
            self.log_info("No wallpapers found in backup")

        return wallpaper_count
