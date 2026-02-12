import logging
import mimetypes
import os
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils.timezone import datetime

from ...models import Backup, File
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class FileExtractor(BaseExtractor):
    def extract(self) -> int:
        step_number = 12
        step_name = 'files'
        
        self.log_info("Starting file extraction...")
        self.update_progress(step_number, step_name, 'Starting file extraction', 0)
        
        KNOWN_EXTENSIONS = {
            'image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic'],
            'video': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'],
            'audio': ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.wma'],
            'document': ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.rtf'],
            'zip': ['.zip', '.rar', '.7z', '.tar', '.gz'],
            'apk': ['.apk', '.aab', '.dex', '.so', '.jar'],
        }
        
        SKIP_EXTENSIONS = {
            '.spbm', '.smem', '.sscm', '.exml', '.espbm', '.esmem', '.esscm',
            '.bk', '.enc', '.db', '.db-shm', '.db-wal', '.bin', '.json', '.xml',
            '.icon', '.penc', '.data'
        }
        
        EXTENSION_CATEGORIES = {}
        for category, extensions in KNOWN_EXTENSIONS.items():
            for ext in extensions:
                EXTENSION_CATEGORIES[ext.lower()] = category
        
        main_folders = [
            'Music', 'Photo', 'Video', 'Docs', 'Download', 'DCIM',
            'Pictures', 'Movies', 'Documents', 'EtcFile', 'MYFILES',
            'PHOTO_ORIGIN'
        ]
        
        file_count = 0
        total_folders = len(main_folders)
        
        def process_file(file_path):
            nonlocal file_count
            
            try:
                file_stat = file_path.stat()
                file_size = file_stat.st_size
                
                try:
                    created_time = datetime.fromtimestamp(file_stat.st_ctime)
                    modified_time = datetime.fromtimestamp(file_stat.st_mtime)
                except:
                    created_time = None
                    modified_time = None
                
                file_ext = file_path.suffix.lower()
                
                if file_ext in SKIP_EXTENSIONS:
                    return
                
                mime_type, _ = mimetypes.guess_type(str(file_path))
                
                category = EXTENSION_CATEGORIES.get(file_ext, 'other')
                try:
                    unique_filename = f"backup_{self.backup_id}_{file_count}_{file_path.name}"
                    
                    with open(file_path, 'rb') as f:
                        file_content = f.read()
                        django_file = ContentFile(file_content, name=unique_filename)
                        file_obj = File.objects.create(
                            backup_id=self.backup_id,
                            file_name=file_path.name,
                            file_size=file_size,
                            file_extension=file_ext[1:] if file_ext else '',
                            mime_type=mime_type,
                            category=category,
                            created_date=created_time,
                            modified_date=modified_time,
                            file=django_file
                        )
                    
                    file_count += 1
                    
                except PermissionError:
                    self.log_error(f"Permission denied when processing file: {file_path}")
                except OSError as e:
                    self.log_error(f"OS error when processing file: {file_path} - {str(e)}")
                
                if file_count % 100 == 0:
                    self.log_info(f"Processed {file_count} files")
            
            except Exception as e:
                self.log_error(f"Error processing file {file_path}: {str(e)}")
        
        for folder_idx, folder_name in enumerate(main_folders):
            folder_path = self._get_file_path(folder_name)
            
            if not folder_path.exists() or not folder_path.is_dir():
                self.log_debug(f"Folder not found: {folder_path}")
                continue
            
            self.log_info(f"Processing folder: {folder_name}")
            self.update_progress(
                step_number,
                step_name,
                f"Processing folder: {folder_name} ({folder_idx+1}/{total_folders})",
                int((folder_idx / total_folders) * 95)
            )
                
            for root, dirs, files in os.walk(folder_path):
                root_path = Path(root)
                
                for file in files:
                    file_path = root_path / file
                    process_file(file_path)
                    
                    if file_count % 100 == 0:
                        folder_progress = int((folder_idx / total_folders) * 95)
                        self.update_progress(
                            step_number,
                            step_name,
                            f"Processing {folder_name}: found {file_count} files",
                            folder_progress
                        )
        
        self.log_info(f"Successfully extracted {file_count} files")
        self.extracted_count = file_count
        
        self.update_progress(
            step_number, 
            step_name, 
            f"Successfully extracted {file_count} files",
            100,
            'completed'
        )
        
        return file_count