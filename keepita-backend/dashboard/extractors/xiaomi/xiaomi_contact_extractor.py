
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from ...models import CallLog, Contact
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class XiaomiContactExtractor(BaseExtractor):
    
    DEFAULT_CALL_TYPE = 'INCOMING'

    def extract(self):
        self.log_info(f"[Backup {self.backup_id}] Starting contact and call log import from server data.")
        contacts_count = self._extract_contacts()
        call_logs_count = self._extract_call_logs()
        self.log_info(f"Import summary: {contacts_count} contacts, {call_logs_count} call logs.")
        return contacts_count + call_logs_count

    def _extract_contacts(self):
        step_number, step_name = 6, 'contacts'
        self.update_progress(step_number, step_name, 'Starting contact import', 0)
        
        json_data = self._load_server_json('contacts')
        if json_data:
            return self._import_contacts_from_json(json_data, step_number, step_name)
        
        self.log_warning("No contact data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_contacts_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing contacts from server JSON data.")
        items = json_data.get('items', [])
        total_contacts = len(items)
        self.update_progress(step_number, step_name, f'Found {total_contacts} contacts from server', 10)
        
        contact_count = 0
        for i, contact_data in enumerate(items):
            name = contact_data.get('name', '')
            phone_number = contact_data.get('phone_number', '')
            
            phones = contact_data.get('phones', [])
            if phones and not phone_number:
                for phone in phones:
                    if isinstance(phone, dict):
                        phone_number = phone.get('number', phone.get('phone', ''))
                    else:
                        phone_number = str(phone)
                    
                    if phone_number:
                        Contact.objects.create(backup_id=self.backup_id, name=name, phone_number=phone_number)
                        contact_count += 1
            elif phone_number:
                Contact.objects.create(backup_id=self.backup_id, name=name, phone_number=phone_number)
                contact_count += 1
            
            if i > 0 and i % 20 == 0 and total_contacts > 0:
                progress = 10 + int((i / total_contacts) * 90)
                self.update_progress(step_number, step_name, f'Importing contacts ({i}/{total_contacts})', progress)

        self.update_progress(step_number, step_name, f'Successfully imported {contact_count} contacts', 100, 'completed')
        return contact_count

    def _extract_call_logs(self):
        step_number, step_name = 7, 'call_logs'
        self.update_progress(step_number, step_name, 'Starting call log import', 0)
        
        json_data = self._load_server_json('call_logs')
        if json_data:
            return self._import_call_logs_from_json(json_data, step_number, step_name)
        
        self.log_warning("No call log data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_call_logs_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing call logs from server JSON data.")
        items = json_data.get('items', [])
        total_calls = len(items)
        self.update_progress(step_number, step_name, f'Found {total_calls} call logs from server', 10)

        call_count = 0
        for i, call_data in enumerate(items):
            try:
                number = call_data.get('number', call_data.get('phone', call_data.get('address', '')))
                name = call_data.get('name', '')
                call_type = call_data.get('type', self.DEFAULT_CALL_TYPE)
                duration = call_data.get('duration', 0)
                date_str = call_data.get('date', call_data.get('timestamp', ''))
                
                call_date = datetime.now()
                if date_str:
                    try:
                        if isinstance(date_str, (int, float)):
                            call_date = datetime.fromtimestamp(date_str / 1000 if date_str > 1e12 else date_str)
                        else:
                            call_date = datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
                    except:
                        pass
                
                normalized = ''.join(filter(str.isdigit, str(number)))
                contact = None
                if normalized:
                    contact = Contact.objects.filter(
                        backup_id=self.backup_id, 
                        phone_number__endswith=normalized[-9:]
                    ).first()
                
                CallLog.objects.create(
                    backup_id=self.backup_id,
                    contact=contact,
                    number=number,
                    name=name if name else (contact.name if contact else ''),
                    date=call_date,
                    duration=int(duration) if duration else 0,
                    type=call_type
                )
                call_count += 1
            except Exception as e:
                self.log_error(f"Error importing call log: {e}")

            if i > 0 and i % 50 == 0 and total_calls > 0:
                progress = 10 + int((i / total_calls) * 90)
                self.update_progress(step_number, step_name, f'Importing call logs ({i}/{total_calls})', progress)

        self.update_progress(step_number, step_name, f'Successfully imported {call_count} call logs', 100, 'completed')
        return call_count

    def _load_server_json(self, data_type: str) -> Optional[dict]:
        json_path = Path(self.backup_root) / '_extracted_json' / f'{data_type}.json'
        if json_path.exists():
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.log_info(f"Loaded {data_type} data from server JSON: {data.get('count', 0)} items")
                    return data
            except Exception as e:
                self.log_error(f"Failed to load server JSON for {data_type}: {e}")
        return None