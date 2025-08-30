import logging
import xml.etree.ElementTree as ET
from pathlib import Path

from django.utils.timezone import datetime

from ..models import CallLog, Contact
from .base_extractor import BaseExtractor

logger = logging.getLogger(__name__)


def normalize_phone_number(number):
    if not number:
        return number
    return "".join(filter(str.isdigit, str(number)))


class CallLogExtractor(BaseExtractor):
    def extract(self) -> int:
        step_number = 7
        step_name = "call_logs"

        call_types = {
            "1": "INCOMING",
            "2": "OUTGOING",
            "3": "MISSED",
            "5": "REJECTED",
            "6": "BLOCKED",
        }

        call_logs_file = self._get_file_path(
            "CALLLOG", "CALLLOG_ext", "call_log_decrypted.xml"
        )
        self.log_info(f"Processing call logs from: {call_logs_file}")

        call_log_count = 0
        if not call_logs_file.exists():
            self.update_progress(
                step_number, step_name, "Call log file not found", 0, "failed"
            )
            self._log_error(f"Call logs file not found at: {call_logs_file}")
            return 0

        try:
            tree = ET.parse(call_logs_file)
            root = tree.getroot()

            call_logs = list(root.findall("CallLog"))
            total_calls = len(call_logs)
            self.log_info(f"Found {total_calls} call log entries")

            self.update_progress(
                step_number,
                step_name,
                f"Found {total_calls} call logs, starting extraction",
                0,
            )

            contacts = {}
            for contact in Contact.objects.filter(backup_id=self.backup_id):
                if contact.phone_number:
                    normalized_number = normalize_phone_number(contact.phone_number)
                    contacts[normalized_number] = contact.id

            for i, call_element in enumerate(call_logs):
                logtype = call_element.find("logtype")
                if logtype is not None and logtype.text == "100":
                    type_element = call_element.find("type")
                    if type_element is None:
                        continue

                    number_element = call_element.find("number")
                    phone_number = (
                        number_element.text if number_element is not None else ""
                    )

                    name_element = call_element.find("name")
                    name = name_element.text if name_element is not None else ""

                    date_element = call_element.find("date")
                    try:
                        call_date = (
                            datetime.fromtimestamp(int(date_element.text) / 1000)
                            if date_element is not None
                            else None
                        )
                    except (ValueError, TypeError):
                        call_date = None

                    duration_element = call_element.find("duration")
                    try:
                        duration = (
                            int(duration_element.text)
                            if duration_element is not None
                            else 0
                        )
                    except (ValueError, TypeError):
                        duration = 0

                    normalized_number = normalize_phone_number(phone_number)
                    contact_id = contacts.get(normalized_number)

                    CallLog.objects.create(
                        backup_id=self.backup_id,
                        contact_id=contact_id,
                        number=phone_number,
                        name=name or "",
                        date=call_date,
                        duration=duration,
                        type=call_types.get(type_element.text, "UNKNOWN"),
                    )

                    call_log_count += 1

                if (i % 50 == 0) or (i == total_calls - 1):
                    progress = int((i / total_calls) * 100)
                    self.update_progress(
                        step_number,
                        step_name,
                        f"Extracting call logs ({i+1}/{total_calls})",
                        progress,
                    )

                if call_log_count % 100 == 0:
                    self.log_info(f"Processed {call_log_count} call logs")

            self.update_progress(
                step_number,
                step_name,
                f"Successfully extracted {call_log_count} call logs",
                100,
                "completed",
            )

            return call_log_count

        except Exception as e:
            self.log_error(f"Error processing call logs: {str(e)}")
            self.update_progress(
                step_number,
                step_name,
                f"Error extracting call logs: {str(e)}",
                0,
                "failed",
            )
            raise
