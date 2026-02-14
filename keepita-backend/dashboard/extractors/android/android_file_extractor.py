import logging
import mimetypes
from pathlib import Path
from django.core.files.base import ContentFile
from django.utils.timezone import datetime

from ..base_extractor import BaseExtractor
from ...models import File

logger = logging.getLogger(__name__)

class AndroidFileExtractor(BaseExtractor):
    def extract(self) -> int:
        self.log_info("Starting Android media file extraction.")
        step_number, step_name = 12, 'files'
        self.update_progress(step_number, step_name, 'Scanning for media files...', 5)

        media_folders = ["photos", "videos", "audios", "documents"]
        file_count = 0
        
        File.objects.filter(backup_id=self.backup_id).delete()
        
        for category in media_folders:
            folder_path = self.backup_root / category
            if not folder_path.is_dir():
                continue
                
            self.log_info(f"Processing folder: {category}")
            files_in_folder = list(folder_path.iterdir())
            total_in_folder = len(files_in_folder)
            
            for i, file_path in enumerate(files_in_folder):
                if not file_path.is_file():
                    continue
                    
                try:
                    with open(file_path, 'rb') as f_content:
                        django_file = ContentFile(f_content.read(), name=file_path.name)
                        
                        file_stat = file_path.stat()
                        
                        File.objects.create(
                            backup_id=self.backup_id,
                            file_name=file_path.name,
                            file_size=file_stat.st_size,
                            file_extension=file_path.suffix[1:].lower() if file_path.suffix else '',
                            mime_type=mimetypes.guess_type(file_path.name)[0],
                            category=category[:-1], 
                            created_date=datetime.fromtimestamp(file_stat.st_ctime),
                            modified_date=datetime.fromtimestamp(file_stat.st_mtime),
                            file=django_file
                        )
                        file_count += 1
                        
                except Exception as e:
                    self.log_error(f"Error processing file {file_path.name}: {e}")

        self.log_info(f"Successfully imported {file_count} media files.")
        self.update_progress(step_number, step_name, f"Successfully extracted {file_count} media files.", 100, 'completed')
        return file_count