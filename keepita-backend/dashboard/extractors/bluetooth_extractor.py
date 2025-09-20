import logging
import xml.etree.ElementTree as ET
from pathlib import Path

from django.utils.timezone import datetime

from ..models import BluetoothDevice
from .base_extractor import BaseExtractor

logger = logging.getLogger(__name__)


class BluetoothExtractor(BaseExtractor):
    def extract(self) -> int:
        step_number = 10
        step_name = "bluetooth"

        bluetooth_file = self._get_file_path(
            "BLUETOOTH", "BLUETOOTH_ext", "bt_config_backup_decrypted.xml"
        )
        self.log_info(f"Processing bluetooth devices from: {bluetooth_file}")

        device_count = 0
        if not bluetooth_file.exists():
            self.update_progress(
                step_number, step_name, "Bluetooth config file not found", 0, "failed"
            )
            self.log_error(f"Bluetooth config file not found at: {bluetooth_file}")
            return 0

        self.update_progress(
            step_number, step_name, "Starting bluetooth device extraction", 0
        )

        try:
            tree = ET.parse(bluetooth_file)
            root = tree.getroot()

            devices = root.findall(".//BondedDevice")
            total_devices = len(devices)
            self.log_info(f"Found {total_devices} bluetooth devices")

            self.update_progress(
                step_number,
                step_name,
                f"Found {total_devices} bluetooth devices, starting extraction",
                10,
            )

            for i, device in enumerate(devices):
                try:
                    address = device.find('string[@name="Address"]')
                    name = device.find('string[@name="Name"]')
                    device_class = device.find('int[@name="Class"]')
                    appearance = device.find('int[@name="Appearance"]')
                    date = device.find('long[@name="Date"]')
                    link_type = device.find('int[@name="LinkType"]')
                    bond_state = device.find('int[@name="BondState"]')
                    uuids = device.find('string[@name="Uuids"]')
                    manufacturer_data = device.find('string[@name="ManufacturerData"]')

                    last_connected = None
                    if date is not None and date.get("value"):
                        timestamp = int(date.get("value")) / 1000
                        last_connected = datetime.fromtimestamp(timestamp)

                    BluetoothDevice.objects.create(
                        backup_id=self.backup_id,
                        address=(address.text if address is not None else None),
                        name=(name.text if name is not None else None),
                        device_class=(
                            int(device_class.get("value"))
                            if device_class is not None
                            else None
                        ),
                        appearance=(
                            int(appearance.get("value"))
                            if appearance is not None
                            else None
                        ),
                        last_connected=last_connected,
                        bond_state=(
                            int(bond_state.get("value"))
                            if bond_state is not None
                            else None
                        ),
                        link_type=(
                            int(link_type.get("value"))
                            if link_type is not None
                            else None
                        ),
                        uuids=(uuids.text if uuids is not None else None),
                        manufacturer_data=(
                            manufacturer_data.text
                            if manufacturer_data is not None
                            else None
                        ),
                    )

                    device_count += 1

                    if (i % 2 == 0) or (i == total_devices - 1):
                        progress = min(10 + int((i / total_devices) * 85), 95)
                        self.update_progress(
                            step_number,
                            step_name,
                            f"Processing bluetooth devices ({i+1}/{total_devices})",
                            progress,
                        )

                except Exception as e:
                    self.log_error(f"Error processing bluetooth device: {str(e)}")
                    continue

            self.log_info(f"Successfully imported {device_count} bluetooth devices")
            self.update_progress(
                step_number,
                step_name,
                f"Successfully extracted {device_count} bluetooth devices",
                100,
                "completed",
            )

            self.extracted_count = device_count

        except Exception as e:
            error_msg = f"Error reading bluetooth file: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, "failed")

        return device_count
