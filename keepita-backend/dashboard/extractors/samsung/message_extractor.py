import json
import logging
from datetime import datetime
from pathlib import Path

from django.db import transaction

from ...models import ChatThread, Contact, Message
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

def normalize_phone_number(number):
    if not number:
        return number
    return ''.join(filter(str.isdigit, str(number)))

def clean_text(text):
    if not text:
        return ""
    cleaned = text.replace('\x00', '')
    return cleaned

class MessageExtractor(BaseExtractor):
    
    def extract(self) -> int:
        step_number = 8
        step_name = 'messages'
        
        self.log_info("Starting message extraction...")
        self.update_progress(step_number, step_name, 'Searching for message files...', 0)
        
        message_file = self._find_message_file()
        
        if not message_file:
            self.log_warning("Message file not found in backup")
            self.update_progress(step_number, step_name, 'Message file not found', 100, 'completed')
            return 0
        
        self.log_info(f"Found message file: {message_file}")
        self.update_progress(step_number, step_name, 'Parsing messages...', 10)
        
        try:
            with open(message_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            if not content.strip():
                self.log_warning("Message file is empty")
                self.update_progress(step_number, step_name, 'Message file is empty', 100, 'completed')
                return 0
            
            try:
                messages_data = json.loads(content)
            except json.JSONDecodeError as e:
                self.log_error(f"Failed to parse message JSON: {e}")
                self.update_progress(step_number, step_name, 'Failed to parse messages', 0, 'failed')
                return 0
            
            if isinstance(messages_data, dict):
                messages_list = messages_data.get('messages', messages_data.get('sms', []))
            elif isinstance(messages_data, list):
                messages_list = messages_data
            else:
                messages_list = []
            
            total_messages = len(messages_list)
            self.log_info(f"Found {total_messages} messages to process")
            
            if total_messages == 0:
                self.update_progress(step_number, step_name, 'No messages found', 100, 'completed')
                return 0
            
            self.update_progress(step_number, step_name, f'Processing {total_messages} messages...', 20)
            
            contacts = {}
            for contact in Contact.objects.filter(backup_id=self.backup_id):
                if contact.phone_number:
                    normalized = normalize_phone_number(contact.phone_number)
                    contacts[normalized] = contact
            
            Message.objects.filter(backup_id=self.backup_id).delete()
            ChatThread.objects.filter(backup_id=self.backup_id).delete()
            
            threads = {}
            message_count = 0
            
            for i, msg_data in enumerate(messages_list):
                try:
                    address = msg_data.get('address', msg_data.get('phone', msg_data.get('number', '')))
                    body = clean_text(msg_data.get('body', msg_data.get('text', msg_data.get('message', ''))))
                    
                    if not address:
                        continue
                    
                    normalized_address = normalize_phone_number(address)
                    
                    if normalized_address not in threads:
                        contact = contacts.get(normalized_address)
                        thread = ChatThread.objects.create(
                            backup_id=self.backup_id,
                            contact=contact,
                            address=address
                        )
                        threads[normalized_address] = thread
                    else:
                        thread = threads[normalized_address]
                    
                    date_str = msg_data.get('date', msg_data.get('timestamp', msg_data.get('time')))
                    message_date = self._parse_date(date_str)
                    
                    msg_type = msg_data.get('type', msg_data.get('msg_type', 1))
                    is_incoming = str(msg_type) == '1' or 'received' in str(msg_type).lower()
                    
                    Message.objects.create(
                        backup_id=self.backup_id,
                        chat_thread=thread,
                        body=body,
                        date=message_date,
                        status=1 if is_incoming else 2,
                        seen=msg_data.get('read', True),
                        service_type='SMS'
                    )
                    
                    message_count += 1
                    
                    if i % 100 == 0 or i == total_messages - 1:
                        progress = 20 + int((i / max(total_messages, 1)) * 75)
                        self.update_progress(step_number, step_name, f'Saving messages ({i+1}/{total_messages})', progress)
                    
                except Exception as e:
                    self.log_error(f"Error saving message: {str(e)}")
                    continue
            
            self.log_info(f"Successfully imported {message_count} messages in {len(threads)} threads")
            self.update_progress(step_number, step_name, f'Successfully extracted {message_count} messages', 100, 'completed')
            
            return message_count
            
        except Exception as e:
            error_msg = f"Error processing messages: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, 'failed')
            return 0
    
    def _find_message_file(self):
        paths = [
            self._get_file_path('MESSAGE', 'Message_ext', '!@ssm@!MESSAGE_JSON_ext', '!@ssm@!sms_restore_decrypted.bk'),
            self._get_file_path('MESSAGE', 'Message_ext', 'sms_restore_decrypted.bk'),
            self._get_file_path('MESSAGE', 'Message_ext', '!@ssm@!sms_restore.bk'),
            self._get_file_path('MESSAGE', 'sms_restore_decrypted.bk'),
        ]
        
        for path in paths:
            if path.exists():
                return path
        
        for pattern in ['*sms_restore*.bk', '*sms_restore*.json']:
            files = list(self.backup_root.rglob(pattern))
            if files:
                return files[0]
        
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
            return datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
        except (ValueError, TypeError):
            pass
        
        return None
