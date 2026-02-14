import logging
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

from ...models import BluetoothDevice
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class BluetoothExtractor(BaseExtractor):
    
    def extract(self) -> int:
        step_number = 10
        step_name = 'bluetooth'
        
        possible_paths = [
            self._get_file_path('BLUETOOTH', 'BLUETOOTH_ext', 'bt_config_backup_decrypted.xml'),
            self._get_file_path('BLUETOOTH', 'BLUETOOTH_ext', 'bt_config_backup.xml'),
            self._get_file_path('BLUETOOTH', 'BLUETOOTH_ext', 'bt_config_backup_ver_6_decrypted.xml'),
            self._get_file_path('BLUETOOTH', 'BLUETOOTH_ext', 'bt_config_backup_ver_6.xml'),
        ]
        
        bluetooth_file = None
        for path in possible_paths:
            if path.exists():
                bluetooth_file = path
                break
        
        if not bluetooth_file:
            self.update_progress(step_number, step_name, 'Bluetooth config file not found', 100, 'completed')
            return 0
        
        self.log_info(f"Processing bluetooth devices from: {bluetooth_file}")
        self.update_progress(step_number, step_name, 'Parsing Bluetooth configuration...', 10)
        
        try:
            with open(bluetooth_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            if not content.strip():
                self.log_warning("Bluetooth config file is empty")
                self.update_progress(step_number, step_name, 'Bluetooth config file is empty', 100, 'completed')
                return 0
            
            try:
                root = ET.fromstring(content)
            except ET.ParseError as e:
                self.log_error(f"XML parsing error: {e}")
                self.update_progress(step_number, step_name, 'Failed to parse Bluetooth XML', 0, 'failed')
                return 0
            
            devices = []
            
            for device_elem in root.iter('BondedDevice'):
                device_data = {
                    'name': None,
                    'address': None,
                    'device_class': None,
                    'appearance': None,
                    'bond_state': None,
                    'link_type': None,
                    'uuids': None,
                    'last_connected': None
                }
                
                for child in device_elem:
                    name_attr = child.get('name', '')
                    value = child.text or child.get('value', '')
                    
                    if name_attr == 'Address':
                        device_data['address'] = value
                    elif name_attr == 'Name':
                        device_data['name'] = value
                    elif name_attr == 'Class':
                        try:
                            device_data['device_class'] = int(value)
                        except (ValueError, TypeError):
                            pass
                    elif name_attr == 'Appearance':
                        try:
                            device_data['appearance'] = int(value)
                        except (ValueError, TypeError):
                            pass
                    elif name_attr == 'BondState':
                        try:
                            device_data['bond_state'] = int(value)
                        except (ValueError, TypeError):
                            pass
                    elif name_attr == 'LinkType':
                        try:
                            device_data['link_type'] = int(value)
                        except (ValueError, TypeError):
                            pass
                    elif name_attr == 'Uuids':
                        device_data['uuids'] = value
                    elif name_attr in ('Date', 'TimeStamp'):
                        try:
                            timestamp = int(value)
                            if timestamp > 10000000000:
                                timestamp = timestamp / 1000
                            device_data['last_connected'] = datetime.fromtimestamp(timestamp)
                        except (ValueError, TypeError, OSError):
                            pass
                
                if device_data['address']:
                    devices.append(device_data)
            
            total_devices = len(devices)
            self.log_info(f"Found {total_devices} Bluetooth devices")
            
            if total_devices == 0:
                self.update_progress(step_number, step_name, 'No Bluetooth devices found', 100, 'completed')
                return 0
            
            self.update_progress(step_number, step_name, f'Processing {total_devices} Bluetooth devices...', 40)
            
            BluetoothDevice.objects.filter(backup_id=self.backup_id).delete()
            
            device_count = 0
            for device in devices:
                try:
                    BluetoothDevice.objects.create(
                        backup_id=self.backup_id,
                        name=device.get('name', 'Unknown'),
                        address=device.get('address', ''),
                        device_class=device.get('device_class'),
                        appearance=device.get('appearance'),
                        bond_state=device.get('bond_state'),
                        link_type=device.get('link_type'),
                        uuids=device.get('uuids'),
                        last_connected=device.get('last_connected')
                    )
                    
                    device_count += 1
                    
                except Exception as e:
                    self.log_error(f"Error saving Bluetooth device: {str(e)}")
                    continue
            
            self.log_info(f"Successfully imported {device_count} Bluetooth devices")
            self.update_progress(step_number, step_name, f'Successfully extracted {device_count} Bluetooth devices', 100, 'completed')
            
            return device_count
            
        except Exception as e:
            error_msg = f"Error processing Bluetooth devices: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, 'failed')
            return 0
