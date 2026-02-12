import json
import logging
import re
from pathlib import Path

from ...models import Contact
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class ContactExtractor(BaseExtractor):
    
    def extract(self) -> int:
        step_number = 6
        step_name = "contacts"
        
        self.log_info("Starting contact extraction...")
        self.update_progress(step_number, step_name, "Searching for contact files...", 0)
        
        json_contacts = self._extract_from_json()
        if json_contacts > 0:
            return json_contacts
        
        vcf_contacts = self._extract_from_vcf()
        if vcf_contacts > 0:
            return vcf_contacts
        
        self.log_warning("No contact files found in backup")
        self.update_progress(step_number, step_name, "No contacts found", 100, "completed")
        return 0
    
    def _extract_from_json(self) -> int:
        step_number = 6
        step_name = "contacts"
        
        json_paths = [
            self._get_file_path('CONTACT', 'Contact_ext', 'CONTACT_JSON_ext', 
                               'vnd.sec.contact.phone-vnd.sec.contact.phone', 
                               'vnd.sec.contact.phone-vnd.sec.contact.phone.json_decrypted.json'),
        ]
        
        contact_json_dir = self._get_file_path('CONTACT', 'Contact_ext', 'CONTACT_JSON_ext')
        if contact_json_dir.exists():
            for json_file in contact_json_dir.rglob('*_decrypted.json'):
                if json_file not in json_paths:
                    json_paths.append(json_file)
        
        all_contacts = []
        
        for json_path in json_paths:
            if not isinstance(json_path, Path):
                json_path = Path(json_path)
            
            if not json_path.exists():
                continue
            
            self.log_info(f"Found contact JSON file: {json_path}")
            
            try:
                with open(json_path, 'r', encoding='utf-8', errors='ignore') as f:
                    data = json.load(f)
                
                raw_contacts = data.get('raw_contacts', [])
                
                for contact in raw_contacts:
                    contact_data = self._parse_samsung_contact(contact)
                    if contact_data:
                        all_contacts.append(contact_data)
                
            except (json.JSONDecodeError, IOError) as e:
                self.log_error(f"Error reading {json_path}: {e}")
                continue
        
        if not all_contacts:
            return 0
        
        self.log_info(f"Found {len(all_contacts)} contacts from JSON files")
        self.update_progress(step_number, step_name, f"Processing {len(all_contacts)} contacts...", 30)
        
        Contact.objects.filter(backup_id=self.backup_id).delete()
        
        contact_count = 0
        seen_phones = set()
        
        for i, contact_data in enumerate(all_contacts):
            try:
                phone = contact_data.get('phone_number', '')
                
                if phone and phone in seen_phones:
                    continue
                if phone:
                    seen_phones.add(phone)
                
                Contact.objects.create(
                    backup_id=self.backup_id,
                    name=contact_data.get('name', 'Unknown')[:255],
                    phone_number=phone[:255] if phone else '',
                    is_favorite=contact_data.get('is_favorite', False)
                )
                contact_count += 1
                
                if i % 50 == 0:
                    progress = 30 + int((i / len(all_contacts)) * 65)
                    self.update_progress(step_number, step_name, f"Saving contacts ({i+1}/{len(all_contacts)})", progress)
                
            except Exception as e:
                self.log_error(f"Error saving contact: {e}")
                continue
        
        self.log_info(f"Successfully extracted {contact_count} contacts from JSON")
        self.update_progress(step_number, step_name, f"Successfully extracted {contact_count} contacts", 100, "completed")
        return contact_count
    
    def _parse_samsung_contact(self, contact):
        display_name = contact.get('display_name', '')
        starred = contact.get('starred', '0') == '1'
        
        phone_number = None
        
        data_list = contact.get('data', [])
        for data_item in data_list:
            mimetype = data_item.get('mimetype', '')
            
            if 'phone' in mimetype:
                phone_number = data_item.get('data4') or data_item.get('data1')
                if phone_number:
                    break
            
            if not display_name and 'name' in mimetype:
                display_name = data_item.get('data1', '')
        
        if not display_name and not phone_number:
            return None
        
        return {
            'name': display_name or 'Unknown',
            'phone_number': phone_number or '',
            'is_favorite': starred
        }
    
    def _extract_from_vcf(self) -> int:
        step_number = 6
        step_name = "contacts"
        
        vcf_dir = self._get_file_path('CONTACT', 'Contact_ext', 'CONTACT_JSON_ext', 
                                      'vnd.sec.contact.phone-vnd.sec.contact.phone')
        
        if not vcf_dir.exists():
            vcf_dir = self._get_file_path('CONTACT', 'Contact_ext')
        
        if not vcf_dir.exists():
            return 0
        
        vcf_files = list(vcf_dir.rglob('*.vcf'))
        
        if not vcf_files:
            return 0
        
        self.log_info(f"Found {len(vcf_files)} VCF files")
        self.update_progress(step_number, step_name, f"Processing {len(vcf_files)} VCF files...", 30)
        
        Contact.objects.filter(backup_id=self.backup_id).delete()
        
        contact_count = 0
        seen_phones = set()
        
        for vcf_file in vcf_files:
            try:
                with open(vcf_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                vcards = re.split(r'(?=BEGIN:VCARD)', content)
                
                for vcard in vcards:
                    if 'BEGIN:VCARD' not in vcard:
                        continue
                    
                    name = self._parse_vcard_name(vcard)
                    phone = self._parse_vcard_phone(vcard)
                    
                    if not name and not phone:
                        continue
                    
                    if phone and phone in seen_phones:
                        continue
                    if phone:
                        seen_phones.add(phone)
                    
                    Contact.objects.create(
                        backup_id=self.backup_id,
                        name=name[:255] if name else 'Unknown',
                        phone_number=phone[:255] if phone else ''
                    )
                    contact_count += 1
                
            except Exception as e:
                self.log_error(f"Error parsing VCF file {vcf_file}: {e}")
                continue
        
        self.log_info(f"Successfully extracted {contact_count} contacts from VCF")
        self.update_progress(step_number, step_name, f"Successfully extracted {contact_count} contacts", 100, "completed")
        return contact_count
    
    def _parse_vcard_name(self, vcard_str: str) -> str:
        fn_match = re.search(r'^FN(?:;[^:]*)?:(.*)$', vcard_str, re.MULTILINE)
        if fn_match:
            return fn_match.group(1).strip()
        
        n_match = re.search(r'^N(?:;[^:]*)?:(.*)$', vcard_str, re.MULTILINE)
        if n_match:
            parts = n_match.group(1).split(';')
            name_parts = [p.strip() for p in parts if p.strip()]
            if name_parts:
                return ' '.join(reversed(name_parts))
        
        return "Unknown"
    
    def _parse_vcard_phone(self, vcard_str: str) -> str:
        tel_match = re.search(r'^TEL(?:;[^:]*)?:(.*)$', vcard_str, re.MULTILINE)
        if tel_match:
            return tel_match.group(1).strip()
        return ""