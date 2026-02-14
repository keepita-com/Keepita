import logging
import tempfile
import mimetypes
from pathlib import Path
import shutil
import zlib
import tarfile

logger = logging.getLogger('dashboard.utils')

MEDIA_CATEGORIES = {
    "photos": {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"},
    "videos": {".mp4", ".mov", ".avi", ".mkv", ".flv"},
    "audios": {".mp3", ".wav", ".aac", ".ogg", ".amr", ".m4a"},
    "documents": {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"},
    "databases": {".db", ".sqlite", ".sqlite3", ".realm"},
    "archives": {".zip", ".rar", ".tar", ".gz", ".7z"},
    "configs": {".xml", ".json", ".ini", ".cfg", ".yaml", ".yml"},
}

def _categorize_file(file_path: Path) -> str:
    ext = file_path.suffix.lower()
    for category, extensions in MEDIA_CATEGORIES.items():
        if ext in extensions:
            return category
    
    mime_type, _ = mimetypes.guess_type(file_path.name)
    if mime_type:
        if mime_type.startswith("image/"): return "photos"
        if mime_type.startswith("video/"): return "videos"
        if mime_type.startswith("audio/"): return "audios"

    return "others"

def _extract_tar_from_ab_stream(ab_file_path: str, output_tar_path: Path):

    CHUNK_SIZE = 1024 * 1024  

    decompressor = zlib.decompressobj()
    
    logger.info("Starting stream-based extraction of .ab file...")
    try:
        with open(ab_file_path, 'rb') as ab_file, open(output_tar_path, 'wb') as tar_file:

            ab_file.seek(24)
            
            while chunk := ab_file.read(CHUNK_SIZE):
                decompressed_chunk = decompressor.decompress(chunk)
                tar_file.write(decompressed_chunk)
            
            remaining_data = decompressor.flush()
            tar_file.write(remaining_data)
        
        logger.info(f"Successfully extracted TAR data from {ab_file_path} to {output_tar_path}")
    except zlib.error as e:
        logger.error(f"Zlib decompression error during streaming extraction: {e}. The backup file might be corrupt or have an unexpected format.", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Error during streaming extraction from .ab file: {e}", exc_info=True)
        raise

def _extract_tar_to_temp(tar_path: Path) -> Path:

    temp_dir = Path(tempfile.mkdtemp())
    try:
        with tarfile.open(tar_path, 'r') as tar:
            tar.extractall(path=temp_dir)
        logger.info(f"Extracted tar contents to: {temp_dir}")
        return temp_dir
    except Exception as e:
        logger.error(f"Failed to extract archive {tar_path}: {e}")
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        raise

def prepare_android_backup(ab_file_path: str, output_dir: Path):

    logger.info(f"Starting preparation of Android backup file with pure Python method: {ab_file_path}")
    tar_path = None
    extracted_raw_dir = None
    
    try:
        tar_path = Path(tempfile.mktemp(suffix=".tar"))
        _extract_tar_from_ab_stream(ab_file_path, tar_path)

        extracted_raw_dir = _extract_tar_to_temp(tar_path)
        
        if not output_dir.exists():
            output_dir.mkdir(parents=True)
            
        stats = {cat: 0 for cat in MEDIA_CATEGORIES.keys()}
        stats["others"] = 0
            
        for file_path in extracted_raw_dir.rglob("*"):
            if not file_path.is_file():
                continue
            
            category = _categorize_file(file_path)
            category_dir = output_dir / category
            category_dir.mkdir(exist_ok=True)
            
            try:
                shutil.copy(file_path, category_dir / file_path.name)
                stats[category] += 1
            except Exception as e:
                logger.error(f"Failed to copy {file_path.name} to {category_dir}: {e}")
        
        logger.info(f"Organized files into categories within {output_dir}. Stats: {stats}")

    finally:
        if tar_path and tar_path.exists():
            tar_path.unlink()
        if extracted_raw_dir and extracted_raw_dir.exists():
            shutil.rmtree(extracted_raw_dir)
        logger.info("Cleanup of temporary Android files complete.")