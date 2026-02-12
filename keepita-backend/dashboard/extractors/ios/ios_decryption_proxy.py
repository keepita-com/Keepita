
import base64
import json
import logging
import os
import sqlite3
from pathlib import Path
from typing import Optional, List, Tuple

import requests
from django.conf import settings

from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)



class IOSDecryptionProxy(BaseExtractor):
    
    KNOWN_IOS_FILES = {
        'AddressBook.sqlitedb': 'contacts',
        'AddressBook-v22.abcddb': 'contacts',
        
        'CallHistory.storedata': 'call_logs',
        'call_history.db': 'call_logs',
        
        'sms.db': 'messages',
        
        'Calendar.sqlitedb': 'calendar',
        
        'notes.sqlite': 'notes',
        'NoteStore.sqlite': 'notes',
        
        'Reminders.sqlite': 'reminders',
        
        'History.db': 'browser',
        'Bookmarks.db': 'browser',
        'BrowserState.db': 'browser',
        
        'voicemail.db': 'voicemail',
        
        'Photos.sqlite': 'photos_db',
        
        'healthdb.sqlite': 'health',
        
        'consolidated.db': 'locations',
        'Local.sqlite': 'locations',
        
        'com.apple.MobileBluetooth.ledevices.paired.db': 'bluetooth',
        'com.apple.MobileBluetooth.ledevices.other.db': 'bluetooth',
        'com.apple.MobileBluetooth.devices.plist': 'bluetooth',
    }
    
    IOS_DB_HASHES = {
        '31bb7ba8914766d4ba40d6dfb6113c8b614be442': 'contacts',
        '2b2b0084a1bc3a5ac8c27afdf14afb42c61a19ca': 'call_logs',
        '5a4935c78a5255723f707230a451d79c540d2741': 'call_logs',
        '3d0d7e5fb2ce288813306e4d4636395e047a3d28': 'messages',
        '2041457d5fe04d39d0ab481178355df6781e6858': 'calendar',
        'ca3bc056d4da0bbf88b5fb3be254f3b7147e639c': 'notes',
        '4f98687d8ab0d6d1a371110e6b7300f6e465bef2': 'notes',
        'e74113c185fd8297e140cfcf9c99436c5cc06b57': 'browser',
        '1b6b187a1b60b9ae8b720c903e38b17ebcc6c2d6': 'browser',
        'd1f062e2da26192a6625d968274bfda8d07821e4': 'browser',
        '60676dc938a4213796caffcb1b488a4ab84a1cc9': 'bluetooth',
        '3afe56e2c5aa8c090ded49445d95e8769ef34899': 'bluetooth',
        '992df473bbb9e132f4b3b6e4d33f72171e97bc7a': 'voicemail',
        '12b144c0bd44f2b3dffd9186d3f9c05b917cc5cb': 'photos',
    }

    def __init__(self, backup_root: str, backup_id: int):
        super().__init__(backup_root, backup_id)
        self.extracted_data_dir = Path(self.backup_root) / '_extracted_json'
        self.extracted_data_dir.mkdir(parents=True, exist_ok=True)
        self._is_decrypted_backup = False

    def extract(self) -> int:
        step_number = 0
        step_name = 'ios_proxy'
        
        self.log_info(f"[Backup {self.backup_id}] Starting iOS server proxy extraction")
        self.update_progress(step_number, step_name, 'Starting iOS proxy', 0)
        
        try:
            api_key = getattr(settings, 'MAIN_SERVER_API_KEY', None)
            if not api_key:
                try:
                    self.log_info("API key not found. Attempting to register client...")
                    api_key = self._register_client_and_get_api_key()
                except Exception as e:
                    self.log_error("MAIN_SERVER_API_KEY not configured and registration failed")
                    self.update_progress(step_number, step_name, 'API key not configured', 0, 'failed')
                    return 0
            
            self._detect_backup_type()
            extractable_files = self._find_extractable_files()
            total_files = len(extractable_files)
            
            self.log_info(f"Found {total_files} iOS files to process (decrypted={self._is_decrypted_backup})")
            
            if total_files == 0:
                self.log_warning("No extractable files found in iOS backup")
                self.update_progress(step_number, step_name, 'No extractable files found', 100, 'completed')
                return 0
            
            processed_count = 0
            for i, (file_path, data_type) in enumerate(extractable_files):
                progress = int((i / total_files) * 90) + 5
                self.update_progress(step_number, step_name, f'Processing {file_path.name}', progress)
                
                self.log_info(f"Processing {file_path.name} as {data_type}")
                result = self._process_file_via_server(file_path, data_type, api_key)
                
                if result and result.get('success'):
                    self._save_extracted_data(data_type, result)
                    processed_count += 1
                    item_count = result.get('count', len(result.get('data', [])))
                    self.log_info(f"Successfully processed {file_path.name}: {item_count} items")
                    
                    if result.get('deliveries'):
                        try:
                            for delivery in result.get('deliveries', []):
                                self._process_delivery(delivery)
                        except Exception as e:
                            self.log_error(f"Failed to handle deliveries: {e}")

                    next_task_id = result.get('next_task_id')
                    if next_task_id:
                        self.log_info(f"Server dispatched a follow-up task: {next_task_id}")
                        task_result = self._poll_task_status(next_task_id)
                        self._handle_decryption_result(task_result)

                else:
                    self.log_warning(f"Server could not process {file_path.name}")
            
            self.log_info(f"iOS proxy completed: {processed_count}/{total_files} files processed")
            self.update_progress(step_number, step_name, f'Processed {processed_count} files', 100, 'completed')
            return processed_count
            
        except Exception as e:
            self.log_error(f"iOS proxy error: {e}", exc_info=True)
            self.update_progress(step_number, step_name, f'Error: {e}', 0, 'failed')
            return 0

    def _detect_backup_type(self):
        backup_path = Path(self.backup_root)
        
        decrypted_indicators = [
            'HomeDomain',
            'CameraRollDomain', 
            'MediaDomain',
            'WirelessDomain',
            'AppDomain',
        ]
        
        for indicator in decrypted_indicators:
            if (backup_path / indicator).exists():
                self._is_decrypted_backup = True
                self.log_info("Detected decrypted iOS backup structure")
                return
        
        decrypted_files_dir = backup_path / 'Decrypted_Files'
        if decrypted_files_dir.exists():
            self._is_decrypted_backup = True
            self.log_info("Detected decrypted iOS backup in Decrypted_Files")
            return
        
        for item in backup_path.iterdir():
            if item.is_dir() and len(item.name) == 2:
                self._is_decrypted_backup = False
                self.log_info("Detected encrypted iOS backup structure")
                return
        
        self._is_decrypted_backup = True
        self.log_info("Assuming decrypted iOS backup")

    def _find_extractable_files(self) -> List[Tuple[Path, str]]:
        files_to_process = []
        backup_path = Path(self.backup_root)
        
        if self._is_decrypted_backup:
            files_to_process = self._find_decrypted_files(backup_path)
        else:
            files_to_process = self._find_encrypted_files(backup_path)
        
        additional_dbs = self._find_all_sqlite_databases(backup_path)
        
        existing_paths = {str(fp) for fp, _ in files_to_process}
        for db_path, db_type in additional_dbs:
            if str(db_path) not in existing_paths:
                files_to_process.append((db_path, db_type))
        
        return files_to_process

    def _find_decrypted_files(self, backup_path: Path) -> List[Tuple[Path, str]]:
        files_to_process = []
        
        for filename, data_type in self.KNOWN_IOS_FILES.items():
            for found_file in backup_path.rglob(filename):
                if found_file.is_file():
                    files_to_process.append((found_file, data_type))
                    self.log_debug(f"Found {filename} -> {data_type}")
        
        return files_to_process

    def _find_encrypted_files(self, backup_path: Path) -> List[Tuple[Path, str]]:
        files_to_process = []
        seen_paths = set()
        
        manifest_db = backup_path / 'Manifest.db'
        if manifest_db.exists():
            manifest_files = self._parse_manifest_db(manifest_db, backup_path)
            for file_path, data_type in manifest_files:
                path_str = str(file_path)
                if path_str not in seen_paths:
                    seen_paths.add(path_str)
                    files_to_process.append((file_path, data_type))
        
        for hash_name, data_type in self.IOS_DB_HASHES.items():
            potential_paths = [
                backup_path / hash_name[:2] / hash_name,
                backup_path / hash_name,
            ]
            for file_path in potential_paths:
                if file_path.exists():
                    path_str = str(file_path)
                    if path_str not in seen_paths:
                        seen_paths.add(path_str)
                        files_to_process.append((file_path, data_type))
                        self.log_debug(f"Found hash {hash_name[:8]}... -> {data_type}")
                    break
        
        return files_to_process

    def _parse_manifest_db(self, manifest_db: Path, backup_path: Path) -> List[Tuple[Path, str]]:
        files_to_process = []
        
        try:
            conn = sqlite3.connect(str(manifest_db))
            cursor = conn.cursor()
            
            cursor.execute("SELECT fileID, domain, relativePath FROM Files WHERE relativePath IS NOT NULL")
            rows = cursor.fetchall()
            conn.close()
            
            for file_id, domain, rel_path in rows:
                if not rel_path:
                    continue
                
                filename = Path(rel_path).name.lower()
                
                for known_file, data_type in self.KNOWN_IOS_FILES.items():
                    if known_file.lower() == filename or known_file.lower() in filename:
                        file_path = backup_path / file_id[:2] / file_id
                        if file_path.exists():
                            files_to_process.append((file_path, data_type))
                            self.log_debug(f"Manifest: {rel_path} -> {data_type}")
                        break
            
        except Exception as e:
            self.log_error(f"Failed to parse Manifest.db: {e}")
        
        return files_to_process

    def _find_all_sqlite_databases(self, backup_path: Path) -> List[Tuple[Path, str]]:
        databases = []
        
        for file_path in backup_path.rglob('*'):
            if not file_path.is_file():
                continue
            
            if file_path.name in self.KNOWN_IOS_FILES:
                continue
            
            try:
                with open(file_path, 'rb') as f:
                    header = f.read(16)
                    if header.startswith(b'SQLite format 3'):
                        databases.append((file_path, 'database'))
                        self.log_debug(f"Found SQLite database: {file_path.name}")
            except:
                continue
        
        return databases


    def _process_file_via_server(self, file_path: Path, data_type: str, api_key: str) -> Optional[dict]:
        try:
            try:
                rel_path = file_path.relative_to(self.backup_root)
            except ValueError:
                rel_path = file_path.name
            
            with open(file_path, 'rb') as f:
                files_payload = {'file': (file_path.name, f)}
                data_payload = {
                    'file_name': file_path.name,
                    'relative_path': str(rel_path),
                    'device_brand': 'ios',
                    'data_type_hint': data_type,
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
                    
                    self.log_debug(f"Server response for {file_path.name}: success={result.get('success')}, count={result.get('count')}, data_type={result.get('data_type')}")
                    return result
                else:
                    self.log_error(f"Server returned {response.status_code} for {file_path.name}: {response.text[:200]}")
                    return None
                    
        except requests.Timeout:
            self.log_error(f"Timeout processing {file_path.name}")
        except Exception as e:
            self.log_error(f"Error sending {file_path.name} to server: {e}")
        
        return None

    def _save_extracted_data(self, data_type: str, result: dict):
        try:
            server_data_type = result.get('data_type', data_type)
            
            if server_data_type in ['metadata', 'dummy', 'media', 'unknown', 'database']:
                self.log_debug(f"Skipping save for type: {server_data_type}")
                return
            
            extracted_data = result.get('data', [])
            if not extracted_data:
                self.log_debug(f"No data to save for {server_data_type}")
                return
            
            json_filename = f"{server_data_type}.json"
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
                    'data_type': server_data_type,
                    'count': len(merged_data),
                    'items': merged_data
                }, f, ensure_ascii=False, indent=2)
            
            self.log_info(f"Saved {len(extracted_data)} {server_data_type} items to JSON")
            
        except Exception as e:
            self.log_error(f"Failed to save extracted data: {e}")

def get_extracted_json_path(backup_root: str, data_type: str) -> Path:
    return Path(backup_root) / '_extracted_json' / f'{data_type}.json'

def has_extracted_data(backup_root: str, data_type: str) -> bool:
    return get_extracted_json_path(backup_root, data_type).exists()

def load_extracted_data(backup_root: str, data_type: str) -> Optional[dict]:
    json_path = get_extracted_json_path(backup_root, data_type)
    if json_path.exists():
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    return None
