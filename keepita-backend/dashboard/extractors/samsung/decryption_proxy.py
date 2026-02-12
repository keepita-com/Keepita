import json
import logging
import os
import shutil
import time
import zipfile
from pathlib import Path
import platform
import socket
import base64

import requests
from django.conf import settings
from getmac import get_mac_address
from dotenv import set_key, find_dotenv

from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)



class DecryptionProxy(BaseExtractor):
    
    CONTAINER_EXTS = [".zip", ".spbm", ".smem", ".sscm"]
    DUMMY_FILE_EXTS = [".spbm", ".sscm", ".smem", ".esmem", ".esscm", ".espbm"]

    ESSENTIAL_ITEMS_MANIFEST = [
        {
            "category": "contacts",
            "source_glob": "CONTACT/Contact_ext/Contact.bk",
            "dest_tuple": ("CONTACT", "Contact_ext", "contact_decrypted.zip"),
            "type": "type4"
        },
        {
            "category": "contacts_json",
            "source_glob": "CONTACT/Contact_ext/CONTACT_JSON.zip",
            "dest_tuple": ("CONTACT", "Contact_ext", "CONTACT_JSON_ext"),
            "type": "extract_only"
        },
        {
            "category": "messages",
            "source_glob": "MESSAGE/Message_ext/!@ssm@!MESSAGE_JSON_ext/!@ssm@!sms_restore.bk",
            "dest_tuple": ("MESSAGE", "Message_ext", "!@ssm@!MESSAGE_JSON_ext", "!@ssm@!sms_restore_decrypted.bk"),
            "type": "type4"
        },
        {
            "category": "call_logs",
            "source_glob": "CALLLOG/CALLLOG_ext/call_log.exml",
            "dest_tuple": ("CALLLOG", "CALLLOG_ext", "call_log_decrypted.xml"),
            "type": "type6",
            "optional": True
        },
        {
            "category": "homescreen",
            "source_glob": "HOMESCREEN/HOMESCREEN_ext/homescreen.exml",
            "dest_tuple": ("HOMESCREEN", "HOMESCREEN_ext", "homescreen_decrypted.xml"),
            "type": "type6",
            "optional": True
        },
        {
            "category": "wifi",
            "source_glob": "WIFICONFIG/WIFICONFIG_ext/wpa_supplicant.conf",
            "dest_tuple": ("WIFICONFIG", "WIFICONFIG_ext", "wpa_supplicant_decrypted.conf"),
            "type": "type4"
        },
        {
            "category": "alarms",
            "source_glob": "ALARM/ALARM_ext/alarm.exml",
            "dest_tuple": ("ALARM", "ALARM_ext", "alarm_decrypted.xml"),
            "type": "type6",
            "optional": True
        },
        {
            "category": "bluetooth",
            "source_glob": "BLUETOOTH/BLUETOOTH_ext/bt_config_backup.xml",
            "dest_tuple": ("BLUETOOTH", "BLUETOOTH_ext", "bt_config_backup_decrypted.xml"),
            "type": "type4",
            "optional": True
        },
        {
            "category": "apps",
            "source_glob": "APKFILE/AppList_ext/AppList.json",
            "dest_tuple": ("APKFILE", "AppList_ext", "AppList.json"),
            "type": "copy_only",
            "optional": True
        },
        {
            "category": "browser",
            "source_glob": "SBROWSER/SBROWSER_ext/**/History.db",
            "dest_tuple": ("SBROWSER", "SBROWSER_ext", "History.db"),
            "type": "copy_only",
            "optional": True
        },
    ]



    def _request_decryption_task(self, source_path, dest_path, dec_type, ssm_dummy_value):
        with open(source_path, 'rb') as file_handle:
            files_payload = {'file': (source_path.name, file_handle)}
            data_payload = {
                'api_key': settings.MAIN_SERVER_API_KEY,
                'source_path': str(source_path),
                'destination_path': str(dest_path),
                'decryption_type': dec_type,
                'ssm_dummy_value': ssm_dummy_value,
            }
            response = requests.post(
                self.get_api_url("decrypt"),
                data=data_payload,
                files=files_payload,
                timeout=30
            )
            response.raise_for_status()
            
            response_json = response.json()
            if 'data' in response_json:
                result = response_json['data']
            else:
                result = response_json

            deliveries = result.get('deliveries', [])
            for delivery in deliveries:
                self._process_delivery(delivery)
            
            return result

    def extract(self) -> int:
        step_number = 5
        step_name = "decrypt"
        self.log_info("Starting Samsung decryption workflow...")

        try:
            self.update_progress(step_number, step_name, "Stage 0: Extracting container files...", 2)
            self._extract_all_containers_recursively()

            if not getattr(settings, 'MAIN_SERVER_API_KEY', None) or settings.MAIN_SERVER_API_KEY == "":
                try:
                    self.log_info("API key not found. Attempting to register client...")
                    self._register_client_and_get_api_key()
                except Exception as e:
                    self.log_warning(f"Could not register with main server: {e}")
                    self.log_info("Continuing without decryption - using existing files if available.")
                    self.update_progress(step_number, step_name, "Server unavailable, using existing files.", 100, "completed")
                    return 0

            self.update_progress(step_number, step_name, "Stage 1: Obtaining master decryption key...", 10)
            try:
                ssm_dummy_value = self._get_ssm_dummy_value()
            except Exception as e:
                self.log_warning(f"Could not obtain master key from server: {e}")
                self.log_info("Continuing without decryption - using existing files if available.")
                self.update_progress(step_number, step_name, "Server unavailable, using existing files.", 100, "completed")
                return 0

            if not ssm_dummy_value:
                self.log_warning("Could not obtain SSM_DummyValue from the Main Server.")
                self.log_info("Continuing without decryption - using existing files if available.")
                self.update_progress(step_number, step_name, "Server unavailable, using existing files.", 100, "completed")
                return 0

            self.log_info(f"Master key obtained: {ssm_dummy_value[:10]}...")
            
            self.update_progress(step_number, step_name, "Stage 2: Processing encrypted files...", 25)
            files_to_process = self._find_files_to_process()
            
            if not files_to_process:
                self.log_info("No files needed decryption.")
                self.update_progress(step_number, step_name, "No files needed decryption.", 100, "completed")
                return 0

            self.log_info(f"Found {len(files_to_process)} files to process.")
            
            task_ids = []
            for i, (source, dest, dec_type) in enumerate(files_to_process):
                try:
                    if dec_type == "copy_only":
                        dest_path = Path(dest)
                        dest_path.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy(source, dest_path)
                        self.log_info(f"Copied {source.name} to {dest_path}")
                    elif dec_type == "extract_only":
                        dest_path = Path(dest)
                        dest_path.mkdir(parents=True, exist_ok=True)
                        with zipfile.ZipFile(source, 'r') as zip_ref:
                            zip_ref.extractall(dest_path)
                        self.log_info(f"Extracted {source.name} to {dest_path}")
                    else:
                        response_data = self._request_decryption_task(source, dest, dec_type, ssm_dummy_value)
                        if response_data and response_data.get('task_id'):
                            task_ids.append(response_data.get('task_id'))
                            
                    progress = 25 + int(((i + 1) / len(files_to_process)) * 50)
                    self.update_progress(step_number, step_name, f"Processing file {i+1}/{len(files_to_process)}", progress)
                    
                except Exception as e:
                    self.log_error(f"Failed to process {source}: {e}")

            self.log_info(f"{len(task_ids)} decryption tasks created. Polling for results...")
            
            tasks_to_poll = list(task_ids)
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
                    self.log_info(f"Server dispatched a follow-up task: {next_task}")
                    tasks_to_poll.append(next_task)
            
            self.log_info("All decryption tasks completed.")
            self.update_progress(step_number, step_name, "Decryption tasks completed.", 90)
            
            self._final_extraction_step()
            self.update_progress(step_number, step_name, "Decryption process complete.", 100, "completed")

            return len(task_ids)

        except Exception as e:
            self.log_error(f"Error in decryption workflow: {e}", exc_info=True)
            self.log_info("Continuing with extraction using existing files...")
            self.update_progress(step_number, step_name, "Decryption skipped, using existing files.", 100, "completed")
            return 0

    def _check_decrypted_files_exist(self):
        key_files = [
            self._get_file_path('CONTACT', 'Contact_ext', 'CONTACT_JSON_ext', 
                               'vnd.sec.contact.phone-vnd.sec.contact.phone',
                               'vnd.sec.contact.phone-vnd.sec.contact.phone.json_decrypted.json'),
            self._get_file_path('MESSAGE', 'Message_ext', '!@ssm@!MESSAGE_JSON_ext', 
                               'sms_restore_decrypted.bk'),
            self._get_file_path('CALLLOG', 'CALLLOG_ext', 'call_log_decrypted.xml'),
        ]
        
        for path in key_files:
            if path.exists() and path.stat().st_size > 0:
                self.log_debug(f"Found existing decrypted file: {path}")
                return True
        
        return False

    def _extract_all_containers_recursively(self):
        extracted_once = set()
        max_iterations = 5
        iteration = 0
        
        while iteration < max_iterations:
            newly_extracted = False
            for filepath in self.backup_root.rglob("*"):
                if filepath.is_file() and filepath.suffix.lower() in self.CONTAINER_EXTS:
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
                            url = self.get_api_url("extract-key")
                            
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
                    self.log_info(f"Prepared: {source_path.name} -> {dest_path} ({task['type']})")
                else:
                    self.log_debug(f"Destination exists for {task['dest_tuple'][-1]}, skipping.")
            else:
                if not task.get("optional", False):
                    self.log_warning(f"Required source file not found: {task['source_glob']}")
                    
        return prepared_files

    def _final_extraction_step(self):
        self.log_info("Performing final extraction on decrypted containers.")
        
        decrypted_contact_zip = self._get_file_path("CONTACT", "Contact_ext", "contact_decrypted.zip")
        if decrypted_contact_zip.exists():
            extract_dir = decrypted_contact_zip.parent / "CONTACT_JSON_ext"
            extract_dir.mkdir(exist_ok=True)
            
            try:
                with zipfile.ZipFile(decrypted_contact_zip, "r") as zip_ref:
                    zip_ref.extractall(extract_dir)
                self.log_info("Extracted contacts archive.")
                
                vnd_dir = extract_dir / "vnd.sec.contact.phone-vnd.sec.contact.phone"
                vnd_dir.mkdir(exist_ok=True)
                
                for index, file in enumerate(extract_dir.rglob("*.vcf"), 1):
                    sanitized_name = f"contact_{index}.vcf"
                    dest_file = vnd_dir / sanitized_name
                    shutil.move(str(file), dest_file)
                
                for file in extract_dir.rglob("*.json"):
                    dest_json = vnd_dir / "vnd.sec.contact.phone-vnd.sec.contact.phone.json_decrypted.json"
                    shutil.move(str(file), dest_json)
                    self.log_info(f"Moved JSON file to: {dest_json}")
                    break
                    
            except Exception as e:
                self.log_error(f"Failed to extract contacts archive: {e}", exc_info=True)
        
        xml_files = [
            ("CALLLOG", "CALLLOG_ext", "call_log_decrypted.xml", "<CallLogs></CallLogs>"),
            ("HOMESCREEN", "HOMESCREEN_ext", "homescreen_decrypted.xml", "<homescreen></homescreen>"),
            ("ALARM", "ALARM_ext", "alarm_decrypted.xml", "<alarms></alarms>"),
            ("BLUETOOTH", "BLUETOOTH_ext", "bt_config_backup_decrypted.xml", "<bluetooth></bluetooth>"),
        ]
        
        for category, subdir, filename, empty_content in xml_files:
            xml_file = self._get_file_path(category, subdir, filename)
            if not xml_file.exists() or xml_file.stat().st_size == 0:
                self.log_info(f"Creating empty {category} file.")
                xml_file.parent.mkdir(parents=True, exist_ok=True)
                with open(xml_file, "w", encoding="utf-8") as f:
                    f.write(f'<?xml version="1.0" encoding="UTF-8"?>{empty_content}')
