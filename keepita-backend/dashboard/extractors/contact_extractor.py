import logging
import quopri
import re
from pathlib import Path

from ..models import Contact
from .base_extractor import BaseExtractor

logger = logging.getLogger(__name__)


class ContactExtractor(BaseExtractor):
    def extract(self) -> int:
        step_number = 6
        step_name = "contacts"
        self.log_info(f"[Backup {self.backup_id}] Starting contact extraction from VCF files.")
        self.update_progress(step_number, step_name, "Searching for VCF contact files...", 0)

        try:
            vcf_dir = self._get_file_path(
                "CONTACT", "Contact_ext", "CONTACT_JSON_ext", "vnd.sec.contact.phone-vnd.sec.contact.phone"
            )

            if not vcf_dir.exists():
                self.log_warning("VCF directory not found. No contacts will be extracted.")
                self.update_progress(step_number, step_name, "VCF directory not found.", 100, "completed")
                return 0

            vcf_files = list(vcf_dir.glob("contact_*.vcf"))
            if not vcf_files:
                self.log_warning("No .vcf files found in the directory.")
                self.update_progress(step_number, step_name, "No VCF files found.", 100, "completed")
                return 0

            self.log_info(f"Found {len(vcf_files)} VCF files to process.")
            
            full_vcf_content = "".join([f.read_text(encoding="utf-8", errors="ignore") for f in vcf_files])
            if not full_vcf_content:
                self.log_warning("VCF files are empty.")
                self.update_progress(step_number, step_name, "VCF files were empty.", 100, "completed")
                return 0

            contacts_data = full_vcf_content.split("BEGIN:VCARD")[1:]
            total_contacts = len(contacts_data)
            self.log_info(f"Found {total_contacts} vCard entries to parse.")
            self.update_progress(step_number, step_name, f"Processing {total_contacts} contacts from VCF...", 10)

            contact_count = 0
            for i, vcard_str in enumerate(contacts_data):
                try:
                    name = self._parse_vcard_name(vcard_str)
                    phone_number = self._parse_vcard_phone(vcard_str)
                    
                    if not name or not phone_number:
                        continue
                    
                    Contact.objects.create(
                        backup_id=self.backup_id,
                        name=name,
                        phone_number=phone_number
                    )
                    contact_count += 1
                except Exception as e:
                    self.log_error(f"Error parsing a vCard entry: {e}", exc_info=True)
            
            self.log_info(f"Successfully extracted and saved {contact_count} contacts.")
            self.update_progress(step_number, step_name, f"Successfully extracted {contact_count} contacts.", 100, "completed")
            return contact_count

        except Exception as e:
            self.log_error(f"A fatal error occurred during contact extraction: {e}", exc_info=True)
            self.update_progress(step_number, step_name, f"Error: {e}", 0, "failed")
            raise

    def _parse_vcard_name(self, vcard_str: str) -> str:
        match = re.search(r"^N(?:;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE)?:(.*)$", vcard_str, re.MULTILINE)
        if not match:
            return "Unknown"
        
        raw_name = match.group(1).strip()
        
        if "QUOTED-PRINTABLE" in match.group(0):
            try:
                clean_name = raw_name.replace("=E2=80=8E", "").replace(";", " ").strip()
                decoded_name = quopri.decodestring(clean_name).decode("utf-8")
                return " ".join(decoded_name.split()).strip()
            except Exception:
                return raw_name
        else:
            return " ".join([part for part in raw_name.split(";") if part]).strip()

    def _parse_vcard_phone(self, vcard_str: str) -> str:
        match = re.search(r"^TEL(?:;.*)?:(.*)$", vcard_str, re.MULTILINE)
        if match:
            return re.sub(r"[^\d+]", "", match.group(1).strip())
        return None