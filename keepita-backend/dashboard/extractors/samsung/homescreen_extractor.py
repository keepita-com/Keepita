import logging
import xml.etree.ElementTree as ET
from pathlib import Path

from ...models import HomeScreenItem, HomeScreenLayout
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class HomeScreenExtractor(BaseExtractor):
    
    def extract(self) -> int:
        step_number = 16
        step_name = 'homescreen'
        
        possible_paths = [
            self._get_file_path('HOMESCREEN', 'HOMESCREEN_ext', 'homescreen_decrypted.xml'),
            self._get_file_path('HOMESCREEN', 'HOMESCREEN_ext', 'homescreen.exml'),
        ]
        
        homescreen_file = None
        for path in possible_paths:
            if path.exists():
                homescreen_file = path
                break
        
        if not homescreen_file:
            self.update_progress(step_number, step_name, 'Home screen file not found', 100, 'completed')
            return 0
        
        self.log_info(f"Processing home screen layout from: {homescreen_file}")
        self.update_progress(step_number, step_name, 'Parsing home screen XML...', 10)
        
        try:
            with open(homescreen_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            if not content.strip():
                self.log_warning("Home screen file is empty")
                self.update_progress(step_number, step_name, 'Home screen file is empty', 100, 'completed')
                return 0
            
            if content.startswith('<?xml'):
                decl_end = content.find('?>')
                if decl_end != -1:
                    content = content[decl_end + 2:].strip()
            
            content = f'<root>{content}</root>'
            
            try:
                root = ET.fromstring(content)
            except ET.ParseError as e:
                self.log_error(f"XML parsing error: {e}")
                self.update_progress(step_number, step_name, 'Failed to parse home screen XML', 0, 'failed')
                return 0
            
            rows = 5
            columns = 4
            page_count = 1
            
            rows_elem = root.find('.//Rows')
            if rows_elem is not None and rows_elem.text:
                try:
                    rows = int(rows_elem.text)
                except ValueError:
                    pass
            
            columns_elem = root.find('.//Columns')
            if columns_elem is not None and columns_elem.text:
                try:
                    columns = int(columns_elem.text)
                except ValueError:
                    pass
            
            page_count_elem = root.find('.//PageCount')
            if page_count_elem is not None and page_count_elem.text:
                try:
                    page_count = int(page_count_elem.text)
                except ValueError:
                    pass
            
            has_zero_page = False
            zero_page_elem = root.find('.//zeroPage')
            if zero_page_elem is not None and zero_page_elem.text:
                has_zero_page = zero_page_elem.text.lower() == 'true'
            
            is_portrait_only = True
            portrait_elem = root.find('.//only_portrait_mode_setting')
            if portrait_elem is not None and portrait_elem.text:
                is_portrait_only = portrait_elem.text.lower() == 'true'
            
            notification_panel = True
            notification_elem = root.find('.//notification_panel_setting')
            if notification_elem is not None and notification_elem.text:
                notification_panel = notification_elem.text.lower() == 'true'
            
            layout_locked = False
            lock_elem = root.find('.//lock_layout_setting')
            if lock_elem is not None and lock_elem.text:
                layout_locked = lock_elem.text.lower() == 'true'
            
            quick_access = True
            quick_elem = root.find('.//quick_access_finder')
            if quick_elem is not None and quick_elem.text:
                quick_access = quick_elem.text.lower() == 'true'
            
            badge_enabled = True
            badge_elem = root.find('.//badge_on_off_setting')
            if badge_elem is not None and badge_elem.text:
                badge_enabled = badge_elem.text != '0'
            
            items = []
            
            home_elem = root.find('.//home')
            if home_elem is not None:
                for item in home_elem:
                    item_data = self._parse_item_element(item, 'home')
                    if item_data:
                        items.append(item_data)
            
            hotseat_elem = root.find('.//hotseat')
            if hotseat_elem is not None:
                for item in hotseat_elem:
                    item_data = self._parse_item_element(item, 'hotseat')
                    if item_data:
                        items.append(item_data)
            
            total_items = len(items)
            self.log_info(f"Found {total_items} home screen items")
            
            if total_items == 0:
                self.update_progress(step_number, step_name, 'No home screen items found', 100, 'completed')
                return 0
            
            self.update_progress(step_number, step_name, f'Processing {total_items} home screen items...', 40)
            
            HomeScreenItem.objects.filter(backup_id=self.backup_id).delete()
            HomeScreenLayout.objects.filter(backup_id=self.backup_id).delete()
            
            layout = HomeScreenLayout.objects.create(
                backup_id=self.backup_id,
                rows=rows,
                columns=columns,
                page_count=page_count,
                has_zero_page=has_zero_page,
                is_portrait_only=is_portrait_only,
                notification_panel_enabled=notification_panel,
                layout_locked=layout_locked,
                quick_access_enabled=quick_access,
                badge_enabled=badge_enabled
            )
            
            item_count = 0
            for item in items:
                try:
                    HomeScreenItem.objects.create(
                        backup_id=self.backup_id,
                        layout=layout,
                        package_name=item.get('package_name', ''),
                        class_name=item.get('class_name', ''),
                        title=item.get('title', ''),
                        screen_index=item.get('screen_index', 0),
                        x=item.get('x', 0),
                        y=item.get('y', 0),
                        span_x=item.get('span_x', 1),
                        span_y=item.get('span_y', 1),
                        item_type=item.get('item_type', 'app'),
                        location=item.get('location', 'home'),
                        app_widget_id=item.get('app_widget_id'),
                        is_hidden=False
                    )
                    
                    item_count += 1
                    
                except Exception as e:
                    self.log_error(f"Error saving home screen item: {str(e)}")
                    continue
            
            self.log_info(f"Successfully imported {item_count} home screen items")
            self.update_progress(step_number, step_name, f'Successfully extracted {item_count} home screen items', 100, 'completed')
            
            return item_count
            
        except Exception as e:
            error_msg = f"Error processing home screen: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, 'failed')
            return 0
    
    def _parse_item_element(self, elem, location):
        tag = elem.tag
        
        package_name = elem.get('packageName', '')
        class_name = elem.get('className', '')
        
        if not package_name:
            return None
        
        if tag == 'appwidget':
            item_type = 'widget'
        elif tag == 'folder':
            item_type = 'folder'
        else:
            item_type = 'app'
        
        try:
            screen_index = int(elem.get('screen', 0))
        except (ValueError, TypeError):
            screen_index = 0
        
        try:
            x = int(elem.get('x', 0))
        except (ValueError, TypeError):
            x = 0
        
        try:
            y = int(elem.get('y', 0))
        except (ValueError, TypeError):
            y = 0
        
        try:
            span_x = int(elem.get('spanX', 1))
        except (ValueError, TypeError):
            span_x = 1
        
        try:
            span_y = int(elem.get('spanY', 1))
        except (ValueError, TypeError):
            span_y = 1
        
        app_widget_id = None
        if elem.get('appWidgetID'):
            try:
                app_widget_id = int(elem.get('appWidgetID'))
            except (ValueError, TypeError):
                pass
        
        title = elem.get('title', '')
        if not title and package_name:
            parts = package_name.split('.')
            if parts:
                title = parts[-1].replace('_', ' ').title()
        
        return {
            'package_name': package_name,
            'class_name': class_name,
            'title': title,
            'screen_index': screen_index,
            'x': x,
            'y': y,
            'span_x': span_x,
            'span_y': span_y,
            'item_type': item_type,
            'location': location,
            'app_widget_id': app_widget_id
        }
