import traceback
import xml.etree.ElementTree as ET
from pathlib import Path

from django.db import transaction

from dashboard.models import ApkList, HomeScreenFolder, HomeScreenItem, HomeScreenLayout

from .base_extractor import BaseExtractor


class HomeScreenExtractor(BaseExtractor):
    def _get_apk_by_package_name(self, package_name):
        if not package_name:
            return None
        try:

            apk = ApkList.objects.filter(
                backup_id=self.backup_id, icon__icontains=package_name
            ).first()

            if not apk:
                apk = ApkList.objects.filter(
                    backup_id=self.backup_id, apk_name__iexact=package_name
                ).first()

            if not apk:
                apk = ApkList.objects.filter(
                    backup_id=self.backup_id,
                    apk_name__icontains=package_name.split(".")[-1],
                ).first()

            if not apk:
                package_parts = package_name.split(".")
                for part in reversed(package_parts):
                    if len(part) > 3:
                        apk = ApkList.objects.filter(
                            backup_id=self.backup_id, icon__icontains=part
                        ).first()
                        if apk:
                            break

            if apk:
                self.log_info(
                    f"Successfully matched package '{package_name}' with APK '{apk.apk_name}' (icon: {apk.icon.name if apk.icon else 'None'})"
                )
            else:
                self.log_info(f"No APK found for package '{package_name}'")

            return apk
        except Exception as e:
            self.log_error(f"Error finding APK for package {package_name}: {e}")
            return None

    def extract(self) -> int:
        step_number = 16
        step_name = "homescreen"

        home_screen_file = self._get_file_path(
            "HOMESCREEN", "HOMESCREEN_ext", "homescreen_decrypted.xml"
        )
        self.log_info(f"Processing home screen layout from: {home_screen_file}")

        if not home_screen_file.exists():
            self.update_progress(
                step_number, step_name, "Home screen layout file not found", 0, "failed"
            )
            self.log_error(f"Home screen layout file not found at: {home_screen_file}")
            return 0

        self.update_progress(
            step_number, step_name, "Starting home screen layout extraction", 0
        )

        try:
            with open(home_screen_file, "r", encoding="utf-8") as f:
                content = f.read()
            content = content.replace(
                "<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>\n", ""
            )
            xml_data = f"<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>\n<root>\n{content}\n</root>"
            root = ET.fromstring(xml_data)

            self.update_progress(step_number, step_name, "Parsing XML data", 20)

        except Exception as e:
            error_msg = f"Error reading/parsing home screen XML: {e}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, "failed")
            return 0

        with transaction.atomic():
            try:
                layout = HomeScreenLayout.objects.create(
                    backup_id=self.backup_id,
                    rows=int(root.find(".//Rows").text),
                    columns=int(root.find(".//Columns").text),
                    page_count=int(root.find(".//PageCount").text),
                    has_zero_page=root.find(".//zeroPage").text.lower() == "true",
                    is_portrait_only=root.find(
                        ".//only_portrait_mode_setting"
                    ).text.lower()
                    == "true",
                    notification_panel_enabled=root.find(
                        ".//notification_panel_setting"
                    ).text.lower()
                    == "true",
                    layout_locked=root.find(".//lock_layout_setting").text.lower()
                    == "true",
                    quick_access_enabled=root.find(
                        ".//quick_access_finder"
                    ).text.lower()
                    == "true",
                    badge_enabled=int(root.find(".//badge_on_off_setting").text) == 1,
                )

                self.update_progress(
                    step_number, step_name, "Created home screen layout", 30
                )

                item_count = 0
                folder_count = 0
                widget_count = 0
                home_elem = root.find(".//home")
                if home_elem is not None:
                    for widget in home_elem.findall("appwidget"):
                        try:
                            package_name = widget.get("packageName")
                            apk = self._get_apk_by_package_name(package_name)

                            HomeScreenItem.objects.create(
                                layout=layout,
                                backup_id=self.backup_id,
                                apk=apk,
                                item_type="widget",
                                screen_index=int(widget.get("screen", 0)),
                                x=int(widget.get("x", 0)),
                                y=int(widget.get("y", 0)),
                                span_x=int(widget.get("spanX", 1)),
                                span_y=int(widget.get("spanY", 1)),
                                package_name=package_name,
                                class_name=widget.get("className"),
                                app_widget_id=int(widget.get("appWidgetID", 0)),
                                location="home",
                            )
                            widget_count += 1
                        except Exception as e:
                            self.log_error(f"Error processing home widget: {e}")
                    for app in home_elem.findall("favorite"):
                        try:
                            package_name = app.get("packageName")
                            apk = self._get_apk_by_package_name(package_name)

                            HomeScreenItem.objects.create(
                                layout=layout,
                                backup_id=self.backup_id,
                                apk=apk,
                                item_type="app",
                                screen_index=int(app.get("screen", 0)),
                                x=int(app.get("x", 0)),
                                y=int(app.get("y", 0)),
                                package_name=package_name,
                                class_name=app.get("className"),
                                location="home",
                            )
                            item_count += 1
                        except Exception as e:
                            self.log_error(f"Error processing home app: {e}")

                self.update_progress(
                    step_number, step_name, "Processed home screen items", 50
                )
                hotseat_elem = root.find(".//hotseat")
                if hotseat_elem is not None:
                    for app in hotseat_elem.findall("favorite"):
                        try:
                            package_name = app.get("packageName")
                            apk = self._get_apk_by_package_name(package_name)

                            HomeScreenItem.objects.create(
                                layout=layout,
                                backup_id=self.backup_id,
                                apk=apk,
                                item_type="app",
                                screen_index=int(app.get("screen", 0)),
                                x=0,
                                y=0,
                                package_name=package_name,
                                class_name=app.get("className"),
                                location="hotseat",
                            )
                            item_count += 1
                        except Exception as e:
                            self.log_error(f"Error processing hotseat app: {e}")

                self.update_progress(
                    step_number, step_name, "Processed hotseat items", 60
                )

                homeonly_elem = root.find(".//homeOnly")
                if homeonly_elem is not None:
                    for widget in homeonly_elem.findall("appwidget"):
                        try:
                            package_name = widget.get("packageName")
                            apk = self._get_apk_by_package_name(package_name)

                            HomeScreenItem.objects.create(
                                layout=layout,
                                backup_id=self.backup_id,
                                apk=apk,
                                item_type="widget",
                                screen_index=int(widget.get("screen", 0)),
                                x=int(widget.get("x", 0)),
                                y=int(widget.get("y", 0)),
                                span_x=int(widget.get("spanX", 1)),
                                span_y=int(widget.get("spanY", 1)),
                                package_name=package_name,
                                class_name=widget.get("className"),
                                app_widget_id=int(widget.get("appWidgetID", 0)),
                                location="homeOnly",
                            )
                            widget_count += 1
                        except Exception as e:
                            self.log_error(f"Error processing homeOnly widget: {e}")
                    for folder_elem in homeonly_elem.findall("folder"):
                        try:
                            folder = HomeScreenFolder.objects.create(
                                layout=layout,
                                title=folder_elem.get("title"),
                                screen_index=int(folder_elem.get("screen", 0)),
                                x=int(folder_elem.get("x", 0)),
                                y=int(folder_elem.get("y", 0)),
                                color=int(folder_elem.get("color", -1)),
                                options=int(folder_elem.get("options", 0)),
                            )
                            folder_count += 1
                            for item in folder_elem.findall("favorite"):
                                try:
                                    package_name = item.get("packageName")
                                    apk = self._get_apk_by_package_name(package_name)

                                    HomeScreenItem.objects.create(
                                        layout=layout,
                                        backup_id=self.backup_id,
                                        folder=folder,
                                        apk=apk,
                                        item_type="app",
                                        screen_index=int(item.get("screen", 0)),
                                        x=0,
                                        y=0,
                                        package_name=package_name,
                                        class_name=item.get("className"),
                                        location="homeOnly",
                                    )
                                    item_count += 1
                                except Exception as e:
                                    self.log_error(f"Error processing folder item: {e}")
                        except Exception as e:
                            self.log_error(f"Error processing folder: {e}")
                            continue
                    for app in homeonly_elem.findall("favorite"):
                        is_direct_child = True
                        for folder in homeonly_elem.findall("folder"):
                            if app in folder.findall("favorite"):
                                is_direct_child = False
                                break
                        if is_direct_child:
                            try:
                                package_name = app.get("packageName")
                                apk = self._get_apk_by_package_name(package_name)

                                HomeScreenItem.objects.create(
                                    layout=layout,
                                    backup_id=self.backup_id,
                                    apk=apk,
                                    item_type="app",
                                    screen_index=int(app.get("screen", 0)),
                                    x=int(app.get("x", 0)),
                                    y=int(app.get("y", 0)),
                                    package_name=package_name,
                                    class_name=app.get("className"),
                                    location="homeOnly",
                                )
                                item_count += 1
                            except Exception as e:
                                self.log_error(f"Error processing homeOnly app: {e}")

                self.update_progress(
                    step_number, step_name, "Processed homeOnly items", 75
                )

                hotseat_homeonly_elem = root.find(".//hotseat_homeOnly")
                if hotseat_homeonly_elem is not None:
                    for app in hotseat_homeonly_elem.findall("favorite"):
                        try:
                            package_name = app.get("packageName")
                            apk = self._get_apk_by_package_name(package_name)

                            HomeScreenItem.objects.create(
                                layout=layout,
                                backup_id=self.backup_id,
                                apk=apk,
                                item_type="app",
                                screen_index=int(app.get("screen", 0)),
                                x=0,
                                y=0,
                                package_name=package_name,
                                class_name=app.get("className"),
                                location="hotseat_homeOnly",
                            )
                            item_count += 1
                        except Exception as e:
                            self.log_error(
                                f"Error processing hotseat_homeOnly app: {e}"
                            )

                apporder_elem = root.find(".//appOrder")
                if apporder_elem is not None:
                    for app in apporder_elem.findall("favorite"):
                        try:
                            package_name = app.get("packageName")
                            apk = self._get_apk_by_package_name(package_name)

                            HomeScreenItem.objects.create(
                                layout=layout,
                                backup_id=self.backup_id,
                                apk=apk,
                                item_type="app",
                                screen_index=int(app.get("screen", 0)),
                                x=0,
                                y=0,
                                package_name=package_name,
                                class_name=app.get("className"),
                                location="appOrder",
                                is_hidden=app.get("hidden") == "1",
                            )
                            item_count += 1
                        except Exception as e:
                            self.log_error(f"Error processing app order item: {e}")

                self.update_progress(
                    step_number, step_name, "Processed remaining items", 90
                )

                self.log_info(f"Successfully imported home screen layout:")
                self.log_info(f"   - {widget_count} widgets")
                self.log_info(f"   - {folder_count} folders")
                self.log_info(f"   - {item_count} items")

                total_items = widget_count + folder_count + item_count
                self.update_progress(
                    step_number,
                    step_name,
                    f"Successfully extracted home screen layout with {total_items} items",
                    100,
                    "completed",
                )

                self.extracted_count = total_items
                return total_items

            except Exception as e:
                error_msg = f"Error processing home screen layout: {str(e)}"
                self.log_error(error_msg)
                self.update_progress(step_number, step_name, error_msg, 0, "failed")
                import traceback

                self.log_error(traceback.format_exc())
                raise
