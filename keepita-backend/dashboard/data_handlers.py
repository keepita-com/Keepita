
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction
from django.utils.timezone import make_aware, now

from .models import (
    Alarm, ApkList, Backup, BluetoothDevice, BrowserHistory, CalendarEvent, CallLog, ChatThread, 
    Contact, File, HomeScreenItem, HomeScreenLayout, Message, Note, WifiNetwork
)

logger = logging.getLogger(__name__)

class DataHandler:
    
    def __init__(self, backup_id: int):
        self.backup_id = backup_id
        self.backup = Backup.objects.get(id=backup_id)
        
        self._contacts_cache = {}
        
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        if not date_str:
            return None
            
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            if dt.tzinfo is None:
                dt = make_aware(dt)
            return dt
        except (ValueError, AttributeError):
            return None
    
    def _normalize_phone(self, number: str) -> str:
        if not number:
            return ''
        return ''.join(filter(str.isdigit, str(number)))
    
    def _get_contact_by_phone(self, phone_number: str) -> Optional[Contact]:
        normalized = self._normalize_phone(phone_number)
        
        if not normalized:
            return None
            
        if normalized not in self._contacts_cache:
            try:
                contact = Contact.objects.filter(
                    backup_id=self.backup_id,
                    phone_number=normalized
                ).first()
                self._contacts_cache[normalized] = contact
            except:
                return None
                
        return self._contacts_cache.get(normalized)
    
    def save_data(self, data_type: str, data: List[Dict]) -> int:
        handlers = {
            'contacts': self.save_contacts,
            'messages': self.save_messages,
            'call_logs': self.save_call_logs,
            'apps': self.save_apps,
            'bluetooth': self.save_bluetooth,
            'wifi': self.save_wifi,
            'alarms': self.save_alarms,
            'notes': self.save_notes,
            'calendar': self.save_calendar,
            'files': self.save_files,
            'browser': self.save_browser,
            'homescreen': self.save_homescreen,
        }
        
        handler = handlers.get(data_type)
        if not handler:
            logger.warning(f"No handler for data type: {data_type}")
            return 0
            
        return handler(data)
    
    @transaction.atomic
    def save_contacts(self, contacts: List[Dict]) -> int:
        count = 0
        
        for contact_data in contacts:
            try:
                phone_number = self._normalize_phone(contact_data.get('phone_number', ''))
                
                if not phone_number:
                    continue
                
                existing = Contact.objects.filter(
                    backup_id=self.backup_id,
                    phone_number=phone_number
                ).first()
                
                if existing:
                    continue
                
                contact = Contact.objects.create(
                    backup_id=self.backup_id,
                    name=contact_data.get('name', ''),
                    phone_number=phone_number,
                    is_favorite=contact_data.get('is_favorite', False),
                    date_of_birth=self._parse_date(contact_data.get('date_of_birth'))
                )
                
                self._contacts_cache[phone_number] = contact
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving contact: {e}")
                continue
        
        logger.info(f"Saved {count} contacts for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_messages(self, messages: List[Dict]) -> int:
        count = 0
        threads_cache = {}
        
        for msg_data in messages:
            try:
                address = msg_data.get('address', '')
                if not address:
                    continue
                
                thread_key = address
                if thread_key not in threads_cache:
                    contact = self._get_contact_by_phone(address)
                    
                    chat_thread, _ = ChatThread.objects.get_or_create(
                        backup_id=self.backup_id,
                        address=address,
                        defaults={
                            'contact': contact
                        }
                    )
                    threads_cache[thread_key] = chat_thread.id
                
                chat_thread_id = threads_cache[thread_key]
                
                Message.objects.create(
                    backup_id=self.backup_id,
                    chat_thread_id=chat_thread_id,
                    body=msg_data.get('body', ''),
                    date=self._parse_date(msg_data.get('date')),
                    status=msg_data.get('status', -1) or -1,
                    seen=msg_data.get('seen', False),
                    sim_slot=msg_data.get('sim_slot', 0) or 0
                )
                
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving message: {e}")
                continue
        
        logger.info(f"Saved {count} messages for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_call_logs(self, call_logs: List[Dict]) -> int:
        count = 0
        
        type_map = {
            'INCOMING': CallLog.CallType.INCOMING,
            'OUTGOING': CallLog.CallType.OUTGOING,
            'MISSED': CallLog.CallType.MISSED,
            'REJECTED': CallLog.CallType.REJECTED,
        }
        
        for call_data in call_logs:
            try:
                number = call_data.get('number', '')
                
                call_type_str = call_data.get('type', 'INCOMING')
                call_type = type_map.get(call_type_str, CallLog.CallType.INCOMING)
                
                CallLog.objects.create(
                    backup_id=self.backup_id,
                    number=number,
                    name=call_data.get('name', ''),
                    date=self._parse_date(call_data.get('date')),
                    duration=call_data.get('duration', 0) or 0,
                    call_type=call_type
                )
                
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving call log: {e}")
                continue
        
        logger.info(f"Saved {count} call logs for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_apps(self, apps: List[Dict]) -> int:
        count = 0
        
        for app_data in apps:
            try:
                package_name = app_data.get('package_name', '')
                
                if ApkList.objects.filter(
                    backup_id=self.backup_id,
                    package_name=package_name
                ).exists():
                    continue
                
                ApkList.objects.create(
                    backup_id=self.backup_id,
                    apk_name=app_data.get('apk_name', ''),
                    package_name=package_name,
                    version_name=app_data.get('version_name', ''),
                    size=app_data.get('size', 0)
                )
                
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving app: {e}")
                continue
        
        logger.info(f"Saved {count} apps for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_bluetooth(self, devices: List[Dict]) -> int:
        count = 0
        
        for device_data in devices:
            try:
                address = device_data.get('address', '')
                
                if BluetoothDevice.objects.filter(
                    backup_id=self.backup_id,
                    address=address
                ).exists():
                    continue
                
                BluetoothDevice.objects.create(
                    backup_id=self.backup_id,
                    address=address,
                    name=device_data.get('name', ''),
                    device_class=device_data.get('device_class', '')
                )
                
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving bluetooth device: {e}")
                continue
        
        logger.info(f"Saved {count} bluetooth devices for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_wifi(self, networks: List[Dict]) -> int:
        count = 0
        
        for network_data in networks:
            try:
                ssid = network_data.get('ssid', '')
                password = network_data.get('password', '')
                
                if WifiNetwork.objects.filter(
                    backup_id=self.backup_id,
                    ssid=ssid,
                    password=password
                ).exists():
                    continue
                
                WifiNetwork.objects.create(
                    backup_id=self.backup_id,
                    ssid=ssid,
                    password=network_data.get('password', ''),
                    security_type=network_data.get('security_type', 'WPA_PSK')
                )
                
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving wifi network: {e}")
                continue
        
        logger.info(f"Saved {count} wifi networks for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_alarms(self, alarms: List[Dict]) -> int:
        count = 0
        
        for alarm_data in alarms:
            try:
                alarm_time = None
                time_str = alarm_data.get('time')
                if time_str:
                    try:
                        if isinstance(time_str, str) and ':' in time_str:
                            parts = time_str.split(':')
                            from datetime import time
                            alarm_time = time(int(parts[0]), int(parts[1]))
                    except:
                        pass
                
                Alarm.objects.create(
                    backup_id=self.backup_id,
                    name=alarm_data.get('name', ''),
                    time=alarm_time,
                    active=alarm_data.get('active', False),
                    repeat_type=alarm_data.get('repeat_type', 0)
                )
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving alarm: {e}")
                continue
        
        logger.info(f"Saved {count} alarms for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_notes(self, notes: List[Dict]) -> int:
        count = 0
        
        for note_data in notes:
            try:
                Note.objects.create(
                    backup_id=self.backup_id,
                    note_id=note_data.get('note_id'),
                    title=note_data.get('title', ''),
                    body=note_data.get('body', ''),
                    creation_date=self._parse_date(note_data.get('creation_date'))
                )
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving note: {e}")
                continue
        
        logger.info(f"Saved {count} notes for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_calendar(self, events: List[Dict]) -> int:
        count = 0
        
        for event_data in events:
            try:
                CalendarEvent.objects.create(
                    backup_id=self.backup_id,
                    summary=event_data.get('summary', ''),
                    start_date=self._parse_date(event_data.get('start_date')),
                    end_date=self._parse_date(event_data.get('end_date')),
                    location=event_data.get('location', '')
                )
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving calendar event: {e}")
                continue
        
        logger.info(f"Saved {count} calendar events for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_files(self, files: List[Dict]) -> int:
        count = 0
        
        for file_data in files:
            try:
                file_name = file_data.get('name', '')
                file_path = file_data.get('path', '')
                file_content = file_data.get('content')
                
                if not file_content:
                    continue
                
                storage_path = f"Users Backups/{self.backup.user.username}/{self.backup.name} {self.backup_id}/Files/{file_path}"
                
                saved_path = default_storage.save(storage_path, ContentFile(file_content))
                
                File.objects.create(
                    backup_id=self.backup_id,
                    name=file_name,
                    path=saved_path,
                    size=len(file_content),
                    file_type=file_data.get('file_type', 'OTHER')
                )
                
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving file: {e}")
                continue
        
        logger.info(f"Saved {count} files for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_browser(self, browser_data: List[Dict]) -> int:
        count = 0
        
        for item in browser_data:
            try:
                item_type = item.get('type', 'history')
                
                if item_type == 'history':
                    url = item.get('url', '')
                    
                    if BrowserHistory.objects.filter(
                        backup_id=self.backup_id,
                        url=url
                    ).exists():
                        continue
                    
                    BrowserHistory.objects.create(
                        backup_id=self.backup_id,
                        url=url,
                        title=item.get('title', ''),
                        visit_count=item.get('visit_count', 1),
                        last_visit_time=self._parse_date(item.get('date')),
                        source='samsung_browser'
                    )
                    count += 1
                    
            except Exception as e:
                logger.error(f"Error saving browser item: {e}")
                continue
        
        logger.info(f"Saved {count} browser history items for backup {self.backup_id}")
        return count
    
    @transaction.atomic
    def save_homescreen(self, homescreen_data: List[Dict]) -> int:
        count = 0
        
        layout, _ = HomeScreenLayout.objects.get_or_create(
            backup_id=self.backup_id,
            defaults={
                'rows': 4,
                'columns': 4,
                'page_count': 1,
                'has_zero_page': False,
                'is_portrait_only': False,
                'notification_panel_enabled': True,
                'layout_locked': False,
                'quick_access_enabled': True,
                'badge_enabled': True
            }
        )
        
        for item in homescreen_data:
            try:
                package_name = item.get('package', '')
                class_name = item.get('class', '')
                
                if not package_name and not class_name:
                    continue
                
                if HomeScreenItem.objects.filter(
                    backup_id=self.backup_id,
                    package_name=package_name,
                    class_name=class_name
                ).exists():
                    continue
                
                item_type = item.get('type', 'app')
                
                HomeScreenItem.objects.create(
                    backup_id=self.backup_id,
                    layout=layout,
                    item_type=item_type,
                    screen_index=item.get('screen', 0),
                    x=item.get('x', 0),
                    y=item.get('y', 0),
                    package_name=package_name,
                    class_name=class_name,
                    location='home'
                )
                count += 1
                
            except Exception as e:
                logger.error(f"Error saving homescreen item: {e}")
                continue
        
        logger.info(f"Saved {count} homescreen items for backup {self.backup_id}")
        return count

def save_extracted_data(backup_id: int, data_type: str, data: List[Dict]) -> int:
    handler = DataHandler(backup_id)
    return handler.save_data(data_type, data)
