
import base64
import json
import logging
import os
import zipfile
from pathlib import Path

import requests
from django.conf import settings

from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

def get_api_url(endpoint="decrypt"):
    base_url = getattr(settings, 'MAIN_SERVER_URL', 'http://localhost:8000')
    return f"{base_url.rstrip('/')}/api/v1/dashboard/{endpoint}/"

class XiaomiDecryptionProxy(BaseExtractor):

    FILE_TYPE_MAPPING = {
        'Contacts(com.android.contacts).bak': 'contacts',
        'Call history(com.android.contacts).bak': 'call_logs',
        'SMS(com.android.mms).bak': 'messages',
        'MMS(com.android.mms).bak': 'mms',
        'Browser(com.android.browser).bak': 'browser',
        'Notes(com.miui.notes).bak': 'notes',
        'WLAN(com.android.providers.settings).bak': 'wifi',
        'com.android.deskclock.bak': 'alarms',
    }

    def __init__(self, backup_root: str, backup_id: int):
        super().__init__(backup_root, backup_id)
        self.backup_root = Path(backup_root)
        self.extracted_data_dir = self.backup_root / '_extracted_json'


    def extract(self) -> int:
        step_number = 5
        step_name = "process"
        self.log_info("Starting Xiaomi server-side processing workflow...")

        try:
            self.extracted_data_dir.mkdir(parents=True, exist_ok=True)

            self.update_progress(step_number, step_name, "Stage 0: Extracting container files...", 2)
            self._extract_all_containers()

            self.update_progress(step_number, step_name, "Stage 1: Finding backup files...", 10)
            bak_files = self._find_bak_files()
            
            if not bak_files:
                self.log_info("No .bak files found.")
                self.update_progress(step_number, step_name, "No .bak files to process.", 100, "completed")
                return 0

            self.log_info(f"Found {len(bak_files)} .bak files to process.")
            
            api_key = getattr(settings, 'MAIN_SERVER_API_KEY', '')
            if not api_key:
                try:
                    self.log_info("API key not found. Attempting to register client...")
                    api_key = self._register_client_and_get_api_key()
                except Exception as e:
                    self.log_warning(f"No API key configured and registration failed: {e}")
                    self.update_progress(step_number, step_name, "No API key, using local parsing.", 100, "completed")
                    return 0

            self.update_progress(step_number, step_name, f"Stage 2: Processing {len(bak_files)} files via server...", 25)
            
            processed_count = 0
            processed_task_ids = set()
            
            for i, bak_file in enumerate(bak_files):
                try:
                    result = self._process_file_via_server(bak_file, api_key)
                    
                    self.log_info(f"DEBUG: Server response for {bak_file.name}: success={result.get('success') if result else 'None'}, next_task_id={result.get('next_task_id') if result else 'None'}")
                    
                    if result and result.get('success'):
                        self._save_extracted_data(bak_file.name, result)
                        
                        deliveries = result.get('deliveries', [])
                        for delivery in deliveries:
                            self._process_delivery(delivery)
                        
                        next_task_id = result.get('next_task_id')
                        if next_task_id and next_task_id not in processed_task_ids:
                            processed_task_ids.add(next_task_id)
                            self.log_info(f"Server dispatched a follow-up task: {next_task_id}")
                            task_result = self._poll_task_status(next_task_id)
                            if task_result:
                                self.log_info(f"DEBUG: Task poll result: {task_result}")
                                self._handle_decryption_result(task_result)
                            else:
                                self.log_warning(f"DEBUG: Task poll returned None for task {next_task_id}")
                        elif next_task_id:
                            self.log_debug(f"Skipping task {next_task_id} - already processed")

                        processed_count += 1
                        self.log_info(f"Processed {bak_file.name}: {result.get('count', 0)} items")
                    elif result:
                        self.log_warning(f"DEBUG: Result was not successful for {bak_file.name}: {result}")
                    else:
                        self.log_warning(f"DEBUG: Result was None for {bak_file.name}")
                    
                    progress = 25 + int(((i + 1) / len(bak_files)) * 70)
                    self.update_progress(step_number, step_name, f"Processed {i+1}/{len(bak_files)} files", progress)
                    
                except Exception as e:
                    self.log_error(f"Failed to process {bak_file.name}: {e}")

            self.log_info(f"Successfully processed {processed_count}/{len(bak_files)} files via main server.")
            self.update_progress(step_number, step_name, f"Processed {processed_count} files.", 100, "completed")
            self.extracted_count = processed_count

            return processed_count

        except Exception as e:
            self.log_error(f"Error in Xiaomi processing workflow: {e}")
            self.update_progress(step_number, step_name, "Processing failed.", 100, "failed")
            return 0

    def _extract_all_containers(self):
        for zip_file in self.backup_root.rglob("*.zip"):
            try:
                extract_dir = zip_file.parent / f"{zip_file.stem}_ext"
                if extract_dir.exists():
                    continue
                    
                extract_dir.mkdir(parents=True, exist_ok=True)
                with zipfile.ZipFile(zip_file, 'r') as zf:
                    zf.extractall(extract_dir)
                self.log_debug(f"Extracted {zip_file.name}")
            except Exception as e:
                self.log_error(f"Failed to extract {zip_file}: {e}")

    def _find_bak_files(self) -> list:
        return list(self.backup_root.rglob("*.bak"))

    def _process_file_via_server(self, file_path: Path, api_key: str) -> dict:
        try:
            with open(file_path, 'rb') as f:
                files_payload = {'file': (file_path.name, f)}
                data_payload = {
                    'file_name': file_path.name,
                    'device_brand': 'xiaomi',
                    'needs_decryption': 'false',
                    'return_json': 'true',
                }
                
                response = requests.post(
                    self.get_api_url("opensource/process-file"),
                    data=data_payload,
                    files=files_payload,
                    headers={'X-API-KEY': api_key},
                    timeout=120
                )
                
                if response.status_code == 200:
                    response_json = response.json()
                    result = response_json
                    
                    if 'data' in result and isinstance(result.get('data'), dict):
                        result = result['data']
                    
                    if 'data' in result and isinstance(result.get('data'), dict):
                        inner = result['data']
                        if 'success' in inner or 'data_type' in inner:
                            result = inner
                    
                    return result
                else:
                    self.log_error(f"Server returned {response.status_code} for {file_path.name}")
                    return None
                    
        except requests.Timeout:
            self.log_error(f"Timeout processing {file_path.name}")
        except Exception as e:
            self.log_error(f"Error sending {file_path.name} to server: {e}")
        
    def _save_extracted_data(self, filename: str, result: dict):
        try:
            data_type = result.get('data_type')
            if not data_type or data_type in ['metadata', 'dummy', 'media']:
                data_type = self.FILE_TYPE_MAPPING.get(filename, 'unknown')
            
            if data_type in ['metadata', 'dummy', 'media', 'unknown']:
                self.log_debug(f"Skipping save for {filename} (type: {data_type})")
                return
            
            extracted_data = result.get('data', [])
            
            if not extracted_data:
                self.log_debug(f"No data to save for {filename}")
                return
            
            json_filename = f"{data_type}.json"
            json_path = self.extracted_data_dir / json_filename
            
            existing_data = []
            if json_path.exists():
                try:
                    with open(json_path, 'r', encoding='utf-8') as f:
                        existing = json.load(f)
                        existing_data = existing.get('items', [])
                except:
                    pass
            
            merged_data = existing_data + extracted_data
            
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump({
                    'source_file': filename,
                    'data_type': data_type,
                    'count': len(merged_data),
                    'items': merged_data
                }, f, ensure_ascii=False, indent=2)
            
            self.log_info(f"Saved {len(extracted_data)} items to {json_path}")
            
        except Exception as e:
            self.log_error(f"Failed to save extracted data for {filename}: {e}")

    def get_extracted_json_path(self, data_type: str) -> Path:
        return self.extracted_data_dir / f"{data_type}.json"

    def has_extracted_data(self, data_type: str) -> bool:
        return self.get_extracted_json_path(data_type).exists()

    def load_extracted_data(self, data_type: str) -> dict:
        json_path = self.get_extracted_json_path(data_type)
        if json_path.exists():
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
