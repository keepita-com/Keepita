
import logging
import json
import zlib
from datetime import datetime
from pathlib import Path

from django.db import transaction
from django.utils.timezone import make_aware

from ..base_extractor import BaseExtractor
from ...models import ChatThread, Message, Contact

logger = logging.getLogger(__name__)

def _normalize_phone(number):
    if not number: return None
    return ''.join(filter(str.isdigit, str(number)))

class AndroidMessageExtractor(BaseExtractor):
    def _convert_timestamp(self, ts):
        try:
            ts_int = int(ts)
            if ts_int > 1e12:
                ts_int //= 1000
            dt = datetime.fromtimestamp(ts_int)
            return make_aware(dt)
        except (ValueError, TypeError, OSError):
            return None

    def extract(self) -> int:
        self.log_info("Starting Android message extraction.")
        step_number, step_name = 8, 'messages'
        self.update_progress(step_number, step_name, 'Searching for SMS backup file...', 5)

        sms_dir = self.backup_root / "others"
        if not sms_dir.is_dir():
            self.update_progress(step_number, step_name, "Message data directory ('others') not found.", 100, 'completed')
            return 0
        
        sms_file = None
        for f in sms_dir.iterdir():
            if "sms" in f.name.lower() and "json" not in f.name.lower():
                sms_file = f
                break
        
        if not sms_file:
            self.log_warning("Android SMS backup file not found.")
            self.update_progress(step_number, step_name, 'SMS file not found.', 100, 'completed')
            return 0
            
        self.log_info(f"Found SMS file: {sms_file}")
        
        try:
            compressed_data = sms_file.read_bytes()
            decompressed_data = zlib.decompress(compressed_data)
            json_text = decompressed_data.decode("utf-8", errors="ignore")
            sms_list = json.loads(json_text)
        except Exception as e:
            self.log_error(f"Failed to read/decompress/parse SMS file: {e}")
            self.update_progress(step_number, step_name, 'Failed to parse SMS file.', 0, 'failed')
            return 0
            
        total_sms = len(sms_list)
        self.log_info(f"Parsed {total_sms} messages from file. Saving to database.")
        self.update_progress(step_number, step_name, f'Found {total_sms} messages, starting import.', 20)

        contacts = { _normalize_phone(c.phone_number): c for c in Contact.objects.filter(backup_id=self.backup_id) }
        threads_cache = {}
        message_count = 0
        
        with transaction.atomic():
            Message.objects.filter(backup_id=self.backup_id).delete()
            ChatThread.objects.filter(backup_id=self.backup_id).delete()
            
            for i, sms_data in enumerate(sms_list):
                try:
                    address = sms_data.get("address")
                    if not address:
                        continue
                        
                    normalized_address = _normalize_phone(address)
                    contact = contacts.get(normalized_address)

                    if address not in threads_cache:
                        thread, _ = ChatThread.objects.get_or_create(
                            backup_id=self.backup_id,
                            address=address,
                            defaults={'contact': contact}
                        )
                        threads_cache[address] = thread
                    
                    is_from_me = sms_data.get("type") == "2"
                    
                    Message.objects.create(
                        backup_id=self.backup_id,
                        chat_thread=threads_cache[address],
                        date=self._convert_timestamp(sms_data.get("date")),
                        body=sms_data.get("body", ""),
                        status=1 if is_from_me else 0,
                        seen=sms_data.get("read") == "1",
                        service_type="sms"
                    )
                    message_count += 1
                    
                    if (i + 1) % 50 == 0:
                        progress = min(95, 20 + int(((i + 1) / total_sms) * 75))
                        self.update_progress(step_number, step_name, f"Saving messages ({i+1}/{total_sms})", progress)

                except Exception as e:
                    self.log_error(f"Error saving SMS entry: {e}")

        self.log_info(f"Successfully imported {message_count} messages.")
        self.update_progress(step_number, step_name, f"Successfully extracted {message_count} messages.", 100, 'completed')
        return message_count