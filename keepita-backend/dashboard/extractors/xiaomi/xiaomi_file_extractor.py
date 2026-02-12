import logging
import mimetypes
import os
import zipfile
from datetime import datetime
from pathlib import Path

from django.core.files.base import ContentFile

from ...models import File
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class XiaomiFileExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 12
        step_name = 'xiaomi_files'
        
        self.log_info("Starting Xiaomi file extraction with deduplication...")
        self.update_progress(step_number, step_name, 'Preparing for extraction', 0)

        try:
            count, _ = File.objects.filter(backup_id=self.backup_id).delete()
            if count > 0:
                self.log_info(f"Cleanup: Removed {count} old file entries for backup ID {self.backup_id}.")
        except Exception as e:
            self.log_error(f"Error during cleanup of old files: {e}")
            self.update_progress(step_number, step_name, "Cleanup failed.", 100, 'failed')
            return 0

        auto_detected_root = self.backup_root
        search_path = auto_detected_root
        self.log_info(f"Starting search for archives in: {search_path}")
        
        found_archives = []
        try:
            for item_name in os.listdir(search_path):
                if item_name.lower().endswith(".zip") and item_name.lower().startswith("backup_"):
                    full_path = search_path / item_name
                    if full_path.is_file():
                        found_archives.append(full_path)
        except FileNotFoundError:
            self.log_error(f"Search directory not found: {search_path}")
            return 0

        if not found_archives:
            self.log_info("No media .zip archives found in the extraction root.")
            self.update_progress(step_number, step_name, "No media archives found.", 100, 'completed')
            return 0
            
        self.log_info(f"Found {len(found_archives)} media archives to process.")
        
        processed_files_signature = set()
        
        total_archives = len(found_archives)
        file_count = 0

        for archive_idx, zip_path in enumerate(found_archives):
            zip_filename = zip_path.name
            category = zip_filename.lower().replace("backup_", "").replace(".zip", "")
            
            archive_progress = int(((archive_idx + 1) / total_archives) * 95)
            self.update_progress(step_number, step_name, f"Processing: {category}", archive_progress)

            try:
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    for member in zip_ref.infolist():
                        if member.is_dir():
                            continue
                        
                        file_signature = (os.path.basename(member.filename), member.file_size)

                        if file_signature in processed_files_signature:
                            self.log_info(f"Skipping duplicate file: {file_signature[0]}")
                            continue

                        try:
                            processed_files_signature.add(file_signature)

                            with zip_ref.open(member) as source_file: file_content = source_file.read()
                            
                            file_path_in_zip = Path(member.filename)
                            file_ext = file_path_in_zip.suffix.lower()
                            mime_type, _ = mimetypes.guess_type(str(file_path_in_zip))
                            modified_time = datetime(*member.date_time)
                            unique_filename = f"backup_{self.backup_id}_{file_count}_{file_path_in_zip.name}"
                            django_file = ContentFile(file_content, name=unique_filename)
                            
                            File.objects.create(
                                backup_id=self.backup_id,
                                file_name=file_path_in_zip.name,
                                file_size=member.file_size,
                                file_extension=file_ext[1:] if file_ext else '',
                                mime_type=mime_type or 'application/octet-stream',
                                category=category,
                                modified_date=modified_time,
                                file=django_file,
                                is_hidden=file_path_in_zip.name.startswith('.')
                            )
                            file_count += 1
                        except Exception as e:
                            self.log_error(f"Error saving item '{member.filename}': {e}", exc_info=True)

            except Exception as e:
                self.log_error(f"Failed to process archive {zip_path}: {e}", exc_info=True)

        self.log_info(f"Successfully extracted {file_count} unique files.")
        self.extracted_count = file_count
        
        self.update_progress(step_number, step_name, f"Successfully extracted {file_count} unique files", 100, 'completed')
        
        return file_count