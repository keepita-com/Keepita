import logging
import xml.etree.ElementTree as ET
from pathlib import Path

from django.utils.timezone import datetime

from ..models import WifiNetwork
from .base_extractor import BaseExtractor

logger = logging.getLogger(__name__)


class WifiExtractor(BaseExtractor):
    def extract(self) -> int:
        step_number = 11
        step_name = "wifi"

        wifi_file = self._get_file_path(
            "WIFICONFIG", "WIFICONFIG_ext", "wpa_supplicant_decrypted.conf"
        )
        self.log_info(f"Processing WiFi networks from: {wifi_file}")

        network_count = 0
        if not wifi_file.exists():
            self.update_progress(
                step_number, step_name, "WiFi networks file not found", 0, "failed"
            )
            self.log_error(f"WiFi networks file not found at: {wifi_file}")
            return 0

        self.update_progress(
            step_number, step_name, "Starting WiFi networks extraction", 0
        )

        try:
            with open(wifi_file, "r", encoding="utf-8") as f:
                content = f.read()

            network_blocks = content.split("network={")
            total_networks = len(network_blocks) - 1

            self.log_info(f"Found {total_networks} WiFi networks")
            self.update_progress(
                step_number,
                step_name,
                f"Found {total_networks} WiFi networks, starting extraction",
                10,
            )

            for i, block in enumerate(network_blocks[1:]):
                try:
                    ssid = None
                    security_type = "NONE"
                    password = None
                    hidden = False
                    frequency = None

                    lines = block.strip().split("\n")
                    for line in lines:
                        line = line.strip()
                        if line.startswith('ssid="'):
                            ssid = line[6:-1]
                        elif line.startswith('psk="'):
                            password = line[5:-1]
                            security_type = "WPA_PSK"
                        elif line.startswith("key_mgmt="):
                            key_mgmt = line[9:]
                            if "NONE" in key_mgmt:
                                security_type = "OPEN"
                            elif "WPA-EAP" in key_mgmt:
                                security_type = "WPA_EAP"
                        elif line.startswith("scan_ssid=1"):
                            hidden = True
                        elif line.startswith("frequency="):
                            try:
                                frequency = int(line[10:])
                            except ValueError:
                                pass

                    if ssid:
                        WifiNetwork.objects.create(
                            backup_id=self.backup_id,
                            ssid=ssid,
                            security_type=security_type,
                            password=password,
                            hidden=hidden,
                            frequency=frequency,
                        )

                        network_count += 1

                    progress = min(10 + int((i / max(total_networks, 1)) * 85), 95)
                    if (i % 2 == 0) or (i == total_networks - 1):
                        self.update_progress(
                            step_number,
                            step_name,
                            f"Processing WiFi networks ({i+1}/{total_networks})",
                            progress,
                        )

                except Exception as e:
                    self.log_error(f"Error processing WiFi network: {str(e)}")
                    continue

            self.log_info(f"Successfully imported {network_count} WiFi networks")
            self.update_progress(
                step_number,
                step_name,
                f"Successfully extracted {network_count} WiFi networks",
                100,
                "completed",
            )

            self.extracted_count = network_count

        except Exception as e:
            error_msg = f"Error reading WiFi networks file: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, "failed")

        return network_count
