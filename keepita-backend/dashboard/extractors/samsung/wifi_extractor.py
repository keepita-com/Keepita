import logging
import re
from pathlib import Path

from ...models import WifiNetwork
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class WifiExtractor(BaseExtractor):
    
    def extract(self) -> int:
        step_number = 11
        step_name = 'wifi'
        
        wifi_file = self._get_file_path('WIFICONFIG', 'WIFICONFIG_ext', 'wpa_supplicant_decrypted.conf')
        self.log_info(f"Processing WiFi networks from: {wifi_file}")
        
        if not wifi_file.exists():
            self.update_progress(step_number, step_name, 'WiFi config file not found', 100, 'completed')
            self.log_debug(f"WiFi config file not found at: {wifi_file}")
            return 0
        
        self.update_progress(step_number, step_name, 'Parsing WiFi configuration...', 10)
        
        try:
            with open(wifi_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            if not content.strip():
                self.log_warning("WiFi config file is empty")
                self.update_progress(step_number, step_name, 'WiFi config file is empty', 100, 'completed')
                return 0
            
            networks = self._parse_wpa_supplicant(content)
            
            total_networks = len(networks)
            self.log_info(f"Found {total_networks} WiFi networks")
            
            if total_networks == 0:
                self.update_progress(step_number, step_name, 'No WiFi networks found', 100, 'completed')
                return 0
            
            self.update_progress(step_number, step_name, f'Processing {total_networks} WiFi networks...', 30)
            
            WifiNetwork.objects.filter(backup_id=self.backup_id).delete()
            
            network_count = 0
            for i, network in enumerate(networks):
                try:
                    ssid = network.get('ssid', '')
                    password = network.get('psk', network.get('password', ''))
                    security_type = network.get('key_mgmt', 'WPA-PSK')
                    
                    if not ssid:
                        continue
                    
                    WifiNetwork.objects.create(
                        backup_id=self.backup_id,
                        ssid=ssid,
                        password=password,
                        security_type=security_type
                    )
                    
                    network_count += 1
                    
                    if i % 20 == 0 or i == total_networks - 1:
                        progress = 30 + int((i / max(total_networks, 1)) * 65)
                        self.update_progress(step_number, step_name, f'Saving networks ({i+1}/{total_networks})', progress)
                    
                except Exception as e:
                    self.log_error(f"Error saving WiFi network: {str(e)}")
                    continue
            
            self.log_info(f"Successfully imported {network_count} WiFi networks")
            self.update_progress(step_number, step_name, f'Successfully extracted {network_count} WiFi networks', 100, 'completed')
            
            return network_count
            
        except Exception as e:
            error_msg = f"Error processing WiFi networks: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, 'failed')
            return 0
    
    def _parse_wpa_supplicant(self, content):
        networks = []
        
        network_blocks = re.findall(r'network\s*=\s*\{([^}]+)\}', content, re.DOTALL | re.IGNORECASE)
        
        for block in network_blocks:
            network = {}
            
            ssid_match = re.search(r'ssid\s*=\s*"?([^"\n]+)"?', block)
            if ssid_match:
                network['ssid'] = ssid_match.group(1).strip().strip('"')
            
            psk_match = re.search(r'psk\s*=\s*"?([^"\n]+)"?', block)
            if psk_match:
                network['psk'] = psk_match.group(1).strip().strip('"')
            
            wep_match = re.search(r'wep_key\d*\s*=\s*"?([^"\n]+)"?', block)
            if wep_match and 'psk' not in network:
                network['psk'] = wep_match.group(1).strip().strip('"')
            
            key_mgmt_match = re.search(r'key_mgmt\s*=\s*([^\n]+)', block)
            if key_mgmt_match:
                network['key_mgmt'] = key_mgmt_match.group(1).strip()
            else:
                if 'psk' in network:
                    network['key_mgmt'] = 'WPA-PSK'
                else:
                    network['key_mgmt'] = 'NONE'
            
            if network.get('ssid'):
                networks.append(network)
        
        return networks
