import logging
import xml.etree.ElementTree as ET
from datetime import time

from ..models import Alarm
from .base_extractor import BaseExtractor

logger = logging.getLogger(__name__)


class AlarmExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 14
        step_name = "alarms"

        alarm_file = self._get_file_path("ALARM", "ALARM_ext", "alarm_decrypted.xml")
        self.log_info(f"Extracting alarms from: {alarm_file}")

        alarm_count = 0
        if not alarm_file.exists():
            self.update_progress(
                step_number, step_name, "Alarm file not found", 0, "failed"
            )
            self.log_error(f"Alarm file not found at: {alarm_file}")
            return 0

        self.update_progress(
            step_number, step_name, "Starting alarm data extraction", 0
        )

        try:
            tree = ET.parse(alarm_file)
            root = tree.getroot()

            alarms = root.findall("./alarm")
            total_alarms = len(alarms)

            self.log_info(f"Found {total_alarms} alarms")
            self.update_progress(
                step_number,
                step_name,
                f"Found {total_alarms} alarms, starting extraction",
                10,
            )

            Alarm.objects.filter(backup_id=self.backup_id).delete()

            for i, alarm_element in enumerate(alarms):
                try:
                    alarm_time_element = alarm_element.find("alarmtime")
                    alarm_time_minutes = None

                    if alarm_time_element is not None and alarm_time_element.text:
                        try:
                            alarm_time_minutes = int(alarm_time_element.text)
                        except ValueError:
                            self.log_error(
                                f"Alarm {i}: Invalid alarm time format: '{alarm_time_element.text}'"
                            )
                            continue

                    if not self._validate_alarm_time_minutes(alarm_time_minutes, i):
                        continue

                    alarm_time = self._convert_minutes_to_time(alarm_time_minutes)

                    name = (
                        alarm_element.find("name").text
                        if alarm_element.find("name") is not None
                        else ""
                    )
                    active = (
                        alarm_element.find("active").text == "1"
                        if alarm_element.find("active") is not None
                        else False
                    )
                    repeat_type = (
                        int(alarm_element.find("repeattype").text)
                        if alarm_element.find("repeattype") is not None
                        else 0
                    )

                    repeat_days = []
                    if repeat_type > 0:
                        repeat_days_element = alarm_element.find("repeatday")
                        if repeat_days_element is not None:
                            for day_element in repeat_days_element.findall("day"):
                                day_value = day_element.text
                                if day_value:
                                    repeat_days.append(int(day_value))

                    Alarm.objects.create(
                        backup_id=self.backup_id,
                        name=name,
                        time=alarm_time,
                        active=active,
                        repeat_type=repeat_type,
                    )

                    alarm_count += 1

                    progress = min(10 + int((i / max(total_alarms, 1)) * 85), 95)
                    if (i % 2 == 0) or (i == total_alarms - 1):
                        self.update_progress(
                            step_number,
                            step_name,
                            f"Processing alarms ({i+1}/{total_alarms})",
                            progress,
                        )

                except Exception as e:
                    self.log_error(f"Error processing alarm: {str(e)}")
                    continue

            self.log_info(f"Successfully imported {alarm_count} alarms")
            self.extracted_count = alarm_count

            self.update_progress(
                step_number,
                step_name,
                f"Successfully extracted {alarm_count} alarms",
                100,
                "completed",
            )

        except Exception as e:
            error_msg = f"Error reading alarm file: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, "failed")
        return alarm_count

    def _validate_alarm_time_minutes(self, minutes, alarm_index):
        if minutes is None:
            self.log_warning(f"Alarm {alarm_index}: No alarm time found")
            return False

        if not isinstance(minutes, int):
            self.log_warning(
                f"Alarm {alarm_index}: Alarm time is not an integer: {minutes}"
            )
            return False

        if minutes < 0:
            self.log_warning(
                f"Alarm {alarm_index}: Negative alarm time minutes: {minutes}"
            )
            return True

        if minutes >= 1440:
            self.log_warning(
                f"Alarm {alarm_index}: Alarm time exceeds 24 hours: {minutes} minutes ({minutes // 60:.1f} hours)"
            )
            return True

        return True

    def _convert_minutes_to_time(self, minutes):
        if minutes is None:
            return None

        if minutes < 0:
            self.log_warning(f"Negative minutes value: {minutes}, setting to 0")
            minutes = 0

        if minutes >= (24 * 60):
            self.log_warning(f"Minutes value {minutes} exceeds 24 hours, taking modulo")
            minutes = minutes % (24 * 60)

        hours = minutes // 60
        mins = minutes % 60

        hours = max(0, min(23, hours))
        mins = max(0, min(59, mins))

        self.log_debug(f"Converted {minutes} minutes to {hours:02d}:{mins:02d}")
        return time(hour=hours, minute=mins)
