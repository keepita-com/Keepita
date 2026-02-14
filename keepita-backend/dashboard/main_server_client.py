
import logging
import os
import time
from typing import Any, Dict, List, Optional
import platform
import socket
from getmac import get_mac_address
from dotenv import set_key, find_dotenv
from pathlib import Path

import requests
from django.conf import settings

logger = logging.getLogger('dashboard')

class MainServerClient:
    
    def __init__(self, base_url: str = None, api_key: str = None):
        self.base_url = base_url or getattr(settings, 'MAIN_SERVER_URL', 'http://localhost:8000')
        self.api_key = api_key or getattr(settings, 'MAIN_SERVER_API_KEY', '')
        
        if not self.api_key or self.api_key == "":
            logger.info("API key not found. Starting auto-registration...")
            self._register_client_and_get_api_key()
        
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-KEY': self.api_key,
        })
        
        self.max_retries = 3
        self.retry_delay = 1
        
        self.timeout = 120
    
    def _register_client_and_get_api_key(self):
        logger.info("API key not found. Starting client registration process...")
        try:
            mac_address = get_mac_address()
            os_type = f"{platform.system()} {platform.release()}"
            try:
                ip_address = socket.gethostbyname(socket.gethostname())
            except socket.gaierror:
                ip_address = "127.0.0.1"
            
            if not mac_address:
                raise ValueError("Could not determine MAC address.")
            
            registration_url = f"{self.base_url}/api/v1/dashboard/register-client/"
            payload = {
                "mac_address": mac_address,
                "os_type": os_type,
                "ip_address": ip_address,
                "name": f"OpenSource-{mac_address}"
            }
            
            logger.info(f"Sending registration request to {registration_url}")
            response = requests.post(registration_url, json=payload, timeout=90)
            response.raise_for_status()
            
            response_json = response.json()
            
            data = response_json.get("data", {})
            new_api_key = data.get("api_key")
            if not new_api_key:
                raise ValueError(f"API key not found in registration response. Response: {response_json}")
            
            logger.info("Client registered successfully. Saving new API key...")
            dotenv_path = find_dotenv()
            if not dotenv_path:
                project_root = Path(settings.BASE_DIR)
                dotenv_path = project_root / '.env'
                dotenv_path.touch()
            
            set_key(str(dotenv_path), "MAIN_SERVER_API_KEY", new_api_key)
            logger.info(f"New API key saved to {dotenv_path}")
            
            settings.MAIN_SERVER_API_KEY = new_api_key
            self.api_key = new_api_key
            
            return new_api_key
            
        except Exception as e:
            logger.error(f"FATAL: Client registration failed. Error: {e}", exc_info=True)
            raise
        
    def _get_url(self, endpoint: str) -> str:
        base = self.base_url.rstrip('/')
        endpoint = endpoint.lstrip('/')
        return f"{base}/api/v1/dashboard/{endpoint}"
    
    def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Dict = None, 
        files: Dict = None,
        retry: bool = True
    ) -> Dict:
        url = self._get_url(endpoint)
        attempts = 0
        last_error = None
        
        while attempts < (self.max_retries if retry else 1):
            attempts += 1
            try:
                logger.debug(f"Making {method} request to {url} (attempt {attempts})")
                
                response = self.session.request(
                    method=method,
                    url=url,
                    data=data,
                    files=files,
                    timeout=self.timeout
                )
                
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.Timeout:
                last_error = f"Request to {url} timed out"
                logger.warning(f"{last_error} (attempt {attempts}/{self.max_retries})")
                
            except requests.exceptions.ConnectionError as e:
                last_error = f"Connection error to {url}: {str(e)}"
                logger.warning(f"{last_error} (attempt {attempts}/{self.max_retries})")
                
            except requests.exceptions.HTTPError as e:
                last_error = f"HTTP error from {url}: {e.response.status_code} - {e.response.text}"
                logger.error(last_error)
                if 400 <= e.response.status_code < 500:
                    return {
                        'success': False,
                        'error': last_error,
                        'status_code': e.response.status_code
                    }
                    
            except Exception as e:
                last_error = f"Unexpected error: {str(e)}"
                logger.error(f"{last_error} (attempt {attempts}/{self.max_retries})")
            
            if attempts < self.max_retries and retry:
                time.sleep(self.retry_delay * attempts)
        
        return {
            'success': False,
            'error': last_error or 'Unknown error occurred'
        }
    
    def extract_key(self, dummy_file_content: bytes) -> Optional[str]:
        try:
            response = self._make_request(
                method='POST',
                endpoint='extract-key/',
                files={'file': ('dummy_file', dummy_file_content)}
            )
            
            result = response.get('data', response)
            ssm_value = result.get('ssm_dummy_value')
            
            if ssm_value:
                logger.info("Successfully extracted SSM_DummyValue from main server")
                return ssm_value
            else:
                logger.error(f"Failed to extract SSM_DummyValue: {result.get('error')}")
                return None
                
        except Exception as e:
            logger.error(f"Error extracting key: {e}", exc_info=True)
            return None
    
    def get_file_decryption_info(self, file_name: str, device_brand: str = 'samsung') -> Dict:
        response = self._make_request(
            method='POST',
            endpoint='opensource/file-info/',
            data={
                'file_name': file_name,
                'device_brand': device_brand
            }
        )
        
        logger.debug(f"File-info raw response for {file_name}: {response}")
        
        first_layer = response.get('data', {})
        result = first_layer.get('data', first_layer)
        
        logger.info(f"File-info for {file_name}: needs_decryption={result.get('needs_decryption')}, type={result.get('decryption_type')}")
        
        return result
    
    def process_file(
        self,
        file_content: bytes,
        file_name: str,
        device_brand: str = 'samsung',
        ssm_dummy_value: Optional[str] = None,
        needs_decryption: bool = False,
        decryption_type: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            data = {
                'file_name': file_name,
                'device_brand': device_brand,
                'needs_decryption': 'true' if needs_decryption else 'false',
            }
            
            if ssm_dummy_value:
                data['ssm_dummy_value'] = ssm_dummy_value
            if decryption_type:
                data['decryption_type'] = decryption_type
            
            response = self._make_request(
                method='POST',
                endpoint='opensource/process-file/',
                data=data,
                files={'file': (file_name, file_content)}
            )
            
            result = response.get('data', response)
            
            if result.get('success'):
                logger.info(f"Successfully processed file: {file_name}, got {result.get('count', 0)} items")
            else:
                logger.warning(f"Failed to process file {file_name}: {result.get('error')}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing file {file_name}: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'data': []
            }
    
    def check_connection(self) -> bool:
        try:
            response = self.session.get(
                self._get_url(''),
                timeout=5
            )
            return response.status_code < 500
        except:
            return False

def get_main_server_client() -> MainServerClient:
    return MainServerClient(
        base_url=getattr(settings, 'MAIN_SERVER_URL', None),
        api_key=getattr(settings, 'MAIN_SERVER_API_KEY', None)
    )

def process_file(
    file_content: bytes,
    file_name: str,
    device_brand: str = 'samsung',
    ssm_dummy_value: Optional[str] = None,
    needs_decryption: bool = False,
    decryption_type: Optional[str] = None
) -> Dict[str, Any]:
    client = get_main_server_client()
    return client.process_file(
        file_content=file_content,
        file_name=file_name,
        device_brand=device_brand,
        ssm_dummy_value=ssm_dummy_value,
        needs_decryption=needs_decryption,
        decryption_type=decryption_type
    )
