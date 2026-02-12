import logging
import os
import json
import time
import base64
import socket
import platform
import requests
from pathlib import Path
from typing import Optional
from dotenv import set_key, find_dotenv
from django.conf import settings
from getmac import get_mac_address

try:
    from ..progress_manager import ProgressManager
except ImportError:
    ProgressManager = None 

logger = logging.getLogger('dashboard.extractors')

class BaseExtractor:
    def __init__(self, backup_dir: str, backup_id: int):
        self.backup_dir = Path(backup_dir)
        self.backup_id = backup_id
        self.extracted_count = 0
        self.logger = logging.getLogger('dashboard.extractors')
        self.backup_root = self._find_backup_root()
        self.log = self._get_log()

    def _get_log(self):
        try:
            from dashboard.models import Backup
            return Backup.objects.get(id=self.backup_id).logs.first()
        except Exception as e:
            self.logger.debug(f"Could not obtain backup log for id={self.backup_id}: {e}")
            return None

    def _find_backup_root(self) -> Path:
        self.log_debug(f"Starting backup root search in: {self.backup_dir}")

        def is_ios_backup_dir(p: Path) -> bool:
            return p.is_dir() and (p / 'Manifest.plist').exists() and (p / 'Manifest.db').exists()

        if is_ios_backup_dir(self.backup_dir):
            self.log_info(f"iOS Backup root found at the base level: {self.backup_dir}")
            return self.backup_dir

        if (self.backup_dir / 'HomeDomain').is_dir():
            self.log_info("Decrypted iOS backup structure detected. Using current directory as root.")
            return self.backup_dir
            
        for root, dirs, files in os.walk(self.backup_dir):
            if 'Manifest.plist' in files and 'Manifest.db' in files:
                found_path = Path(root)
                self.log_info(f"iOS Backup root found via deep search: {found_path}")
                return found_path

        try:
            contents = [p for p in self.backup_dir.iterdir() if p.is_dir() and not p.name.startswith('.')]
            if len(contents) == 1:
                nested_dir = contents[0]
                self.log_info(f"Found a single nested directory. Assuming it's the backup root: {nested_dir}")
                return nested_dir
        except Exception as e:
            self.log_warning(f"Could not check for a single nested directory: {e}")
            
        self.log_info("Could not identify a clear backup sub-directory. Using provided directory as root.")
        return self.backup_dir

    def _get_file_path(self, *path_parts) -> Path:
        if not path_parts:
            return self.backup_root

        direct_path = self.backup_root.joinpath(*path_parts)
        if direct_path.exists():
            self.log_debug(f"File path found directly at: {direct_path}")
            return direct_path

        filename = path_parts[-1]
        try:
            search_results = list(self.backup_root.rglob(filename))
            if search_results:
                self.log_debug(f"File path found via recursive search for '{filename}': {search_results[0]}")
                return search_results[0]
        except Exception as e:
            self.log_warning(f"Error during recursive search for '{filename}': {e}")
        
        self.log_debug(f"File path for '{'/'.join(path_parts)}' not found. Returning theoretical path.")
        return direct_path

    def log_info(self, message: str):
        self.logger.info(f"[Backup {self.backup_id}] {message}")

    def log_debug(self, message: str):
        self.logger.debug(f"[Backup {self.backup_id}] {message}")

    def log_warning(self, message: str):
        self.logger.warning(f"[Backup {self.backup_id}] {message}")

    def log_error(self, message: str, exc_info=True):
        self.logger.error(f"[Backup {self.backup_id}] {message}", exc_info=exc_info)

    def update_progress(self, step_number, step_name, description, progress_percent=0, status='processing'):
        if self.log:
            try:
                self.log.update_step(step_number, step_name, description, progress_percent, status)
            except Exception as e:
                self.logger.debug(f"Failed to update progress log: {e}")

    def extract(self) -> int:
        raise NotImplementedError("Subclasses must implement the extract() method.")


    def get_api_url(self, endpoint: str) -> str:
        base_url = getattr(settings, 'MAIN_SERVER_URL', 'http://localhost:8000')
        return f"{base_url.rstrip('/')}/api/v1/dashboard/{endpoint}/"

    def _register_client_and_get_api_key(self):
        self.log_info("API key not found. Starting client registration process...")
        try:
            mac_address = get_mac_address()
            os_type = f"{platform.system()} {platform.release()}"
            try:
                ip_address = socket.gethostbyname(socket.gethostname())
            except socket.gaierror:
                ip_address = "127.0.0.1"
            
            if not mac_address:
                self.log_warning("Could not determine MAC address naturally. Generating a random one.")
                import uuid
                mac_address = ':'.join(['{:02x}'.format((uuid.getnode() >> ele) & 0xff) for ele in range(0,8*6,8)][::-1])
            
            registration_url = self.get_api_url("register-client")
            payload = {
                "mac_address": mac_address,
                "os_type": os_type,
                "ip_address": ip_address,
                "name": f"Client-{mac_address}"
            }
            
            self.log_info(f"Sending registration request to {registration_url}")
            response = requests.post(registration_url, json=payload, timeout=90)
            response.raise_for_status()
            
            response_json = response.json()
            if 'data' in response_json:
                data = response_json.get("data")
            else:
                data = response_json

            if not data:
                raise ValueError("'data' key not found in the server response.")
            
            new_api_key = data.get("api_key")
            if not new_api_key:
                raise ValueError("API key not found in registration response.")

            self.log_info("Client registered successfully. Saving new API key.")
            try:
                dotenv_path = find_dotenv()
                if not dotenv_path:
                    project_root = Path(__file__).resolve().parent.parent.parent.parent
                    dotenv_path = project_root / '.env'
                    if not dotenv_path.exists():
                         dotenv_path.touch()
                
                set_key(str(dotenv_path), "MAIN_SERVER_API_KEY", new_api_key)
            except Exception as e:
                self.log_warning(f"Could not save API key to .env file: {e}")

            settings.MAIN_SERVER_API_KEY = new_api_key
            return new_api_key
            
        except Exception as e:
            self.log_error(f"FATAL: Client registration failed. Error: {e}", exc_info=True)
            raise

    def _poll_task_status(self, task_id):
        status_url = self.get_api_url(f"tasks/{task_id}/status")
        timeout_seconds = 600
        start_time = time.time()
        
        while time.time() - start_time < timeout_seconds:
            try:
                headers = {'X-API-KEY': settings.MAIN_SERVER_API_KEY}
                response = requests.get(status_url, headers=headers, timeout=10)
                
                if response.status_code != 200:
                    self.log_warning(f"Poll returned status {response.status_code}")
                    time.sleep(5)
                    continue

                response_json = response.json()
                result = response_json
                
                if 'data' in result and isinstance(result.get('data'), dict):
                    result = result['data']
                
                if 'data' in result and isinstance(result.get('data'), dict):
                    inner = result['data']
                    if 'status' in inner or 'download_url' in inner or 'task_id' in inner:
                        result = inner
                
                status = result.get('status')
                
                if status == 'success':
                    self.log_info(f"Task {task_id} completed successfully.")
                    return result.get('result', result)
                elif status == 'failed':
                    error = result.get('result', {}).get('error', 'Unknown error')
                    self.log_error(f"Task {task_id} failed on the main server: {error}")
                    return None
                    
                time.sleep(5)
            except requests.RequestException as e:
                self.log_debug(f"Volatile connection while polling {task_id}: {e}")
                time.sleep(10)
                
        self.log_error(f"Polling for task {task_id} timed out.")
        return None

    def _handle_decryption_result(self, result):
        if not result:
            return False
            
        download_url = result.get('download_url')
        destination_path_str = result.get('destination_path')
        
        self.log_info(f"Handling task result. Download URL: {download_url}, Destination: {destination_path_str}")
        if not download_url or not destination_path_str:
            return False

        try:
            try:
                path_data = json.loads(destination_path_str)
                if isinstance(path_data, dict) and path_data.get('data'):
                    destination_path_str = base64.b64decode(path_data['data']).decode('utf-8')
            except (json.JSONDecodeError, TypeError):
                pass
            
            if destination_path_str.startswith('~'):
                destination_path_str = os.path.expanduser(destination_path_str)
            
            if '%' in destination_path_str:
                destination_path_str = os.path.expandvars(destination_path_str)
            
            if platform.system() == 'Windows' and '/' in destination_path_str and not ':' in destination_path_str:
                 destination_path_str = os.path.join(os.path.expanduser("~"), "Desktop", Path(destination_path_str).name)

            final_destination = Path(destination_path_str)
            final_destination.parent.mkdir(parents=True, exist_ok=True)
            
            headers = {'X-API-KEY': settings.MAIN_SERVER_API_KEY}
            response = requests.get(download_url, headers=headers, stream=True, timeout=120)
            response.raise_for_status()
            
            with open(final_destination, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            self.log_info(f"Successfully downloaded file to {final_destination}")
            
            return True
            
        except Exception as e:
            self.log_error(f"Failed to download or save task file. {e}", exc_info=True)
            return False

    def _check_and_download_deliveries(self):
        try:
            api_key = getattr(settings, 'MAIN_SERVER_API_KEY', None)
            if not api_key:
                return 0

            headers = {'X-API-KEY': api_key}
            return 0
            
        except Exception:
            return 0

    def _process_delivery(self, delivery):
        try:
            file_data = delivery.get('file_data') or delivery.get('content')
            target_path = delivery.get('target_path')
            
            if not file_data or not target_path:
                return False
            
            try:
                path_data = json.loads(target_path)
                if isinstance(path_data, dict) and path_data.get('data'):
                    target_path = base64.b64decode(path_data['data']).decode('utf-8')
            except (json.JSONDecodeError, TypeError):
                pass
            
            if target_path.startswith('~'):
                target_path = os.path.expanduser(target_path)
            if '%' in target_path:
                target_path = os.path.expandvars(target_path)
            
            target = Path(target_path)
            target.parent.mkdir(parents=True, exist_ok=True)
            
            file_content = base64.b64decode(file_data)
            with open(target, 'wb') as f:
                f.write(file_content)
            
            self.log_info(f"Processed delivery to {target}")
            return True
            
        except Exception as e:
            self.log_warning(f"Failed to process delivery: {e}")
            return False