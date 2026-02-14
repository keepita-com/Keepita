import logging
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

from ...models import CallLog, Contact
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

def normalize_phone_number(number):
    if not number:
        return number
    return ''.join(filter(str.isdigit, str(number)))

class CallLogExtractor(BaseExtractor):
    
    def extract(self) -> int:
        step_number = 7
        step_name = 'call_logs'
        
        call_logs_file = self._get_file_path('CALLLOG', 'CALLLOG_ext', 'call_log_decrypted.xml')
        self.log_info(f"Processing call logs from: {call_logs_file}")
        
        if not call_logs_file.exists():
            self.update_progress(step_number, step_name, 'Call log file not found', 100, 'completed')
            self.log_warning(f"Call logs file not found at: {call_logs_file}")
            return 0
        
        self.update_progress(step_number, step_name, 'Parsing call log XML...', 10)
        call_log_count = 0
        
        try:
            with open(call_logs_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            if not content.strip():
                self.log_warning("Call log file is empty")
                self.update_progress(step_number, step_name, 'Call log file is empty', 100, 'completed')
                return 0
            
            try:
                root = ET.fromstring(content)
            except ET.ParseError as e:
                self.log_error(f"XML parsing error: {e}")
                self.update_progress(step_number, step_name, 'Failed to parse call log XML', 0, 'failed')
                return 0
            
            call_elements = []
            for tag in ['CallLog', 'call', 'log', 'row', 'item']:
                call_elements = root.findall(f".//{tag}")
                if call_elements:
                    break
            
            if not call_elements:
                call_elements = list(root)
            
            total_logs = len(call_elements)
            self.log_info(f"Found {total_logs} call log entries")
            
            if total_logs == 0:
                self.update_progress(step_number, step_name, 'No call logs found in file', 100, 'completed')
                return 0
            
            self.update_progress(step_number, step_name, f'Processing {total_logs} call logs...', 20)
            
            contacts = {}
            for contact in Contact.objects.filter(backup_id=self.backup_id):
                if contact.phone_number:
                    normalized = normalize_phone_number(contact.phone_number)
                    contacts[normalized] = contact.id
            
            CallLog.objects.filter(backup_id=self.backup_id).delete()
            
            for i, call_elem in enumerate(call_elements):
                try:
                    phone_number = self._get_value(call_elem, ['number', 'phone', 'phoneNumber', 'address'])
                    name = self._get_value(call_elem, ['name', 'contactName', 'displayName'])
                    duration = self._get_value(call_elem, ['duration', 'dur'])
                    call_type = self._get_value(call_elem, ['type', 'callType'])
                    date_str = self._get_value(call_elem, ['date', 'time', 'timestamp', 'dateTime'])
                    
                    call_date = None
                    if date_str:
                        call_date = self._parse_date(date_str)
                    
                    try:
                        duration = int(duration) if duration else 0
                    except (ValueError, TypeError):
                        duration = 0
                    
                    call_type_mapped = self._map_call_type(call_type)
                    
                    normalized_number = normalize_phone_number(phone_number)
                    contact_id = contacts.get(normalized_number)
                    
                    CallLog.objects.create(
                        backup_id=self.backup_id,
                        contact_id=contact_id,
                        number=phone_number or '',
                        name=name or '',
                        date=call_date,
                        duration=duration,
                        type=call_type_mapped
                    )
                    
                    call_log_count += 1
                    
                    if i % 100 == 0 or i == total_logs - 1:
                        progress = 20 + int((i / max(total_logs, 1)) * 75)
                        self.update_progress(step_number, step_name, f'Saving call logs ({i+1}/{total_logs})', progress)
                    
                except Exception as e:
                    self.log_error(f"Error saving call log: {str(e)}")
                    continue
            
            self.log_info(f"Successfully imported {call_log_count} call logs")
            self.update_progress(step_number, step_name, f'Successfully extracted {call_log_count} call logs', 100, 'completed')
            
            return call_log_count
            
        except Exception as e:
            error_msg = f"Error processing call logs: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, 'failed')
            return 0
    
    def _get_value(self, elem, keys):
        for key in keys:
            val = elem.get(key)
            if val:
                return val
            
            child = elem.find(key)
            if child is not None and child.text:
                return child.text
        
        return None
    
    def _parse_date(self, date_str):
        if not date_str:
            return None
        
        try:
            timestamp = int(date_str)
            if timestamp > 10000000000:
                timestamp = timestamp / 1000
            return datetime.fromtimestamp(timestamp)
        except (ValueError, TypeError, OSError):
            pass
        
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except (ValueError, TypeError):
            pass
        
        formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y/%m/%d %H:%M:%S',
            '%d-%m-%Y %H:%M:%S',
            '%Y-%m-%dT%H:%M:%S',
        ]
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except (ValueError, TypeError):
                continue
        
        return None
    
    def _map_call_type(self, call_type):
        if not call_type:
            return 'INCOMING'
        
        call_type_str = str(call_type).upper()
        
        if '1' in call_type_str or 'INCOMING' in call_type_str or 'IN' in call_type_str:
            return 'INCOMING'
        elif '2' in call_type_str or 'OUTGOING' in call_type_str or 'OUT' in call_type_str:
            return 'OUTGOING'
        elif '3' in call_type_str or 'MISSED' in call_type_str:
            return 'MISSED'
        elif '4' in call_type_str or 'VOICEMAIL' in call_type_str:
            return 'VOICEMAIL'
        elif '5' in call_type_str or 'REJECTED' in call_type_str:
            return 'REJECTED'
        elif '6' in call_type_str or 'BLOCKED' in call_type_str:
            return 'BLOCKED'
        
        return 'INCOMING'
