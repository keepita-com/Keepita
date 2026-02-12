
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from django.db import transaction

from ...models import ChatThread, Contact, Message
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

def normalize_phone_number(number):
    if not number:
        return None
    return ''.join(filter(str.isdigit, str(number)))

class XiaomiMessageExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 8
        step_name = 'messages'
        
        json_data = self._load_server_json('messages')
        if json_data:
            return self._import_messages_from_json(json_data, step_number, step_name)
        
        self.log_warning("No message data from server. Skipping.")
        self.update_progress(step_number, step_name, 'No server data available', 100, 'completed')
        return 0

    def _import_messages_from_json(self, json_data: dict, step_number: int, step_name: str) -> int:
        self.log_info(f"[Backup {self.backup_id}] Importing messages from server JSON data.")
        items = json_data.get('items', [])
        total_messages = len(items)
        self.update_progress(step_number, step_name, f'Found {total_messages} messages from server', 10)

        contacts = {
            normalize_phone_number(c.phone_number): c.id
            for c in Contact.objects.filter(backup_id=self.backup_id) if c.phone_number
        }

        message_count = 0
        thread_count = 0
        threads_cache = {}

        with transaction.atomic():
            Message.objects.filter(backup_id=self.backup_id).delete()
            ChatThread.objects.filter(backup_id=self.backup_id).delete()

            for i, msg_data in enumerate(items):
                try:
                    address = msg_data.get('address', msg_data.get('sender', 'Unknown'))
                    body = msg_data.get('body', msg_data.get('text', ''))
                    seen = msg_data.get('seen', msg_data.get('read', False))
                    sim_slot = msg_data.get('sim_slot')
                    date_str = msg_data.get('date', msg_data.get('timestamp'))
                    
                    msg_date = None
                    if date_str:
                        try:
                            if isinstance(date_str, (int, float)):
                                msg_date = datetime.fromtimestamp(date_str / 1000 if date_str > 1e12 else date_str)
                            else:
                                msg_date = datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
                        except:
                            pass
                    
                    normalized_address = normalize_phone_number(address)
                    contact_id = contacts.get(normalized_address)

                    if address not in threads_cache:
                        chat_thread, created = ChatThread.objects.get_or_create(
                            backup_id=self.backup_id,
                            address=address,
                            defaults={'contact_id': contact_id}
                        )
                        threads_cache[address] = chat_thread.id
                        if created:
                            thread_count += 1

                    Message.objects.create(
                        backup_id=self.backup_id,
                        chat_thread_id=threads_cache[address],
                        date=msg_date,
                        body=body,
                        seen=bool(seen),
                        sim_slot=sim_slot,
                        status=-1
                    )
                    message_count += 1

                    if (i + 1) % 50 == 0:
                        progress = min(95, 10 + int(((i + 1) / total_messages) * 85))
                        self.update_progress(step_number, step_name, f"Importing messages ({i+1}/{total_messages})", progress)

                except Exception as e:
                    self.log_error(f"Error importing message {i}: {e}")
                    continue

        self.log_info(f"Successfully imported {message_count} messages in {thread_count} threads from server.")
        self.update_progress(step_number, step_name, f"Successfully imported {message_count} messages", 100, 'completed')
        return message_count

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
