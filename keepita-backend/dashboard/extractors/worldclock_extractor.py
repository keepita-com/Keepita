import logging
import xml.etree.ElementTree as ET

from ..models import WorldClock
from .base_extractor import BaseExtractor

logger = logging.getLogger(__name__)


class WorldClockExtractor(BaseExtractor):

    def extract(self) -> int:
        step_number = 15
        step_name = "worldclocks"

        worldclock_file = self._get_file_path(
            "WORLDCLOCK", "WORLDCLOCK_ext", "worldclock_decrypted.xml"
        )
        self.log_info(f"Extracting world clocks from: {worldclock_file}")

        clock_count = 0
        if not worldclock_file.exists():
            self.update_progress(
                step_number, step_name, "World clock file not found", 0, "failed"
            )
            self.log_error(f"World clock file not found at: {worldclock_file}")
            return 0

        self.update_progress(
            step_number, step_name, "Starting world clock extraction", 0
        )

        try:
            tree = ET.parse(worldclock_file)
            root = tree.getroot()

            clocks = root.findall("./worldclock/item")
            total_clocks = len(clocks)

            self.log_info(f"Found {total_clocks} world clocks")
            self.update_progress(
                step_number,
                step_name,
                f"Found {total_clocks} world clocks, starting extraction",
                10,
            )

            WorldClock.objects.filter(backup_id=self.backup_id).delete()

            for i, clock_element in enumerate(clocks):
                try:
                    clock_id = (
                        int(clock_element.find("_id").text)
                        if clock_element.find("_id") is not None
                        else None
                    )
                    city = (
                        clock_element.find("city").text
                        if clock_element.find("city") is not None
                        else None
                    )
                    timezone = (
                        clock_element.find("gmt").text
                        if clock_element.find("gmt") is not None
                        else None
                    )

                    if not city or not timezone:
                        continue

                    dst_offset = (
                        int(clock_element.find("dst").text)
                        if (
                            clock_element.find("dst") is not None
                            and clock_element.find("dst").text != "-1"
                        )
                        else 0
                    )
                    home_zone_id = (
                        int(clock_element.find("homezone").text)
                        if clock_element.find("homezone") is not None
                        else 0
                    )
                    point_x = (
                        int(clock_element.find("pointX").text)
                        if (
                            clock_element.find("pointX") is not None
                            and clock_element.find("pointX").text != "-1"
                        )
                        else 0
                    )
                    point_y = (
                        int(clock_element.find("pointY").text)
                        if (
                            clock_element.find("pointY") is not None
                            and clock_element.find("pointY").text != "-1"
                        )
                        else 0
                    )

                    WorldClock.objects.create(
                        backup_id=self.backup_id,
                        clock_id=clock_id,
                        city_name=city,
                        timezone=timezone,
                        dst_offset=dst_offset,
                        home_zone_id=home_zone_id,
                        point_x=point_x,
                        point_y=point_y,
                    )

                    clock_count += 1

                    progress = min(10 + int((i / max(total_clocks, 1)) * 85), 95)
                    if (i % 2 == 0) or (i == total_clocks - 1):
                        self.update_progress(
                            step_number,
                            step_name,
                            f"Processing world clocks ({i+1}/{total_clocks})",
                            progress,
                        )

                except Exception as e:
                    self.log_error(f"Error processing world clock: {str(e)}")
                    continue

            self.log_info(f"Successfully imported {clock_count} world clocks")
            self.extracted_count = clock_count

            self.update_progress(
                step_number,
                step_name,
                f"Successfully extracted {clock_count} world clocks",
                100,
                "completed",
            )

        except Exception as e:
            error_msg = f"Error reading world clock file: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, "failed")

        return clock_count
