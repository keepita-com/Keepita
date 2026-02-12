import logging
import xml.etree.ElementTree as ET
from datetime import time
from pathlib import Path

from ...models import Alarm
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class AlarmExtractor(BaseExtractor):
    
    def extract(self) -> int:
        step_number = 14
        step_name = 'alarms'
        
        possible_paths = [
            self._get_file_path('ALARM', 'ALARM_ext', 'alarm_decrypted.xml'),
            self._get_file_path('ALARM', 'ALARM_ext', 'alarm.exml'),
        ]
        
        alarm_file = None
        for path in possible_paths:
            if path.exists():
                alarm_file = path
                break
        
        if not alarm_file:
            self.update_progress(step_number, step_name, 'Alarm file not found', 100, 'completed')
            return 0
        
        self.log_info(f"Extracting alarms from: {alarm_file}")
        self.update_progress(step_number, step_name, 'Parsing alarms...', 10)
        
        try:
            with open(alarm_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            if not content.strip():
                self.log_warning("Alarm file is empty")
                self.update_progress(step_number, step_name, 'Alarm file is empty', 100, 'completed')
                return 0
            
            try:
                root = ET.fromstring(content)
            except ET.ParseError as e:
                self.log_error(f"XML parsing error: {e}")
                self.update_progress(step_number, step_name, 'Failed to parse alarm XML', 0, 'failed')
                return 0
            
            alarms = []
            
            for alarm_elem in root.iter('alarm'):
                alarm_data = {
                    'name': None,
                    'time': None,
                    'active': False,
                    'repeat_type': None
                }
                
                for child in alarm_elem:
                    tag = child.tag
                    value = child.text or ''
                    
                    if tag == 'name':
                        alarm_data['name'] = value if value else None
                    elif tag == 'active':
                        alarm_data['active'] = value == '1'
                    elif tag == 'alarmtime':
                        try:
                            minutes = int(value)
                            hours = minutes // 60
                            mins = minutes % 60
                            alarm_data['time'] = time(hour=hours % 24, minute=mins)
                        except (ValueError, TypeError):
                            pass
                    elif tag == 'repeattype':
                        try:
                            alarm_data['repeat_type'] = int(value)
                        except (ValueError, TypeError):
                            pass
                
                if alarm_data['time']:
                    alarms.append(alarm_data)
            
            total_alarms = len(alarms)
            self.log_info(f"Found {total_alarms} alarms")
            
            if total_alarms == 0:
                self.update_progress(step_number, step_name, 'No alarms found', 100, 'completed')
                return 0
            
            self.update_progress(step_number, step_name, f'Processing {total_alarms} alarms...', 40)
            
            Alarm.objects.filter(backup_id=self.backup_id).delete()
            
            alarm_count = 0
            for alarm in alarms:
                try:
                    Alarm.objects.create(
                        backup_id=self.backup_id,
                        name=alarm.get('name'),
                        time=alarm.get('time'),
                        active=alarm.get('active', False),
                        repeat_type=alarm.get('repeat_type')
                    )
                    
                    alarm_count += 1
                    
                except Exception as e:
                    self.log_error(f"Error saving alarm: {str(e)}")
                    continue
            
            self.log_info(f"Successfully imported {alarm_count} alarms")
            self.update_progress(step_number, step_name, f'Successfully extracted {alarm_count} alarms', 100, 'completed')
            
            return alarm_count
            
        except Exception as e:
            error_msg = f"Error processing alarms: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, 'failed')
            return 0
