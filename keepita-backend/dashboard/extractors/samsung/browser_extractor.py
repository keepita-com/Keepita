import logging
import sqlite3
from datetime import datetime
from pathlib import Path

from ...models import BrowserHistory
from ..base_extractor import BaseExtractor

logger = logging.getLogger(__name__)

class BrowserExtractor(BaseExtractor):
    
    def extract(self) -> int:
        step_number = 13
        step_name = 'browser'
        
        self.log_info("Starting browser data extraction...")
        self.update_progress(step_number, step_name, 'Searching for browser database...', 0)
        
        browser_file = self._find_browser_db()
        
        if not browser_file:
            self.log_debug("Browser database not found")
            self.update_progress(step_number, step_name, 'Browser data not found', 100, 'completed')
            return 0
        
        self.log_info(f"Found browser database: {browser_file}")
        self.update_progress(step_number, step_name, 'Parsing browser history...', 20)
        
        try:
            conn = sqlite3.connect(str(browser_file))
            cursor = conn.cursor()
            
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            self.log_debug(f"Browser DB tables: {tables}")
            
            history_items = []
            
            if 'urls' in tables:
                try:
                    cursor.execute("""
                        SELECT url, title, visit_count, last_visit_time
                        FROM urls
                        ORDER BY last_visit_time DESC
                    """)
                    for row in cursor.fetchall():
                        url, title, visit_count, last_visit = row
                        
                        visit_date = None
                        if last_visit:
                            try:
                                if last_visit > 10000000000000:
                                    seconds = (last_visit - 11644473600000000) / 1000000
                                    visit_date = datetime.fromtimestamp(seconds)
                                else:
                                    visit_date = datetime.fromtimestamp(last_visit / 1000)
                            except (ValueError, OSError):
                                pass
                        
                        history_items.append({
                            'url': url,
                            'title': title or '',
                            'visit_count': visit_count or 1,
                            'last_visit': visit_date
                        })
                except sqlite3.Error as e:
                    self.log_error(f"Error reading urls table: {e}")
            
            if not history_items and 'history' in tables:
                try:
                    cursor.execute("SELECT url, title, date FROM history ORDER BY date DESC")
                    for row in cursor.fetchall():
                        url, title, date_val = row
                        visit_date = None
                        if date_val:
                            try:
                                visit_date = datetime.fromtimestamp(date_val / 1000)
                            except (ValueError, OSError):
                                pass
                        
                        history_items.append({
                            'url': url,
                            'title': title or '',
                            'visit_count': 1,
                            'last_visit': visit_date
                        })
                except sqlite3.Error as e:
                    self.log_error(f"Error reading history table: {e}")
            
            conn.close()
            
            total_items = len(history_items)
            self.log_info(f"Found {total_items} browser history items")
            
            if total_items == 0:
                self.update_progress(step_number, step_name, 'No browser history found', 100, 'completed')
                return 0
            
            self.update_progress(step_number, step_name, f'Processing {total_items} history items...', 40)
            
            BrowserHistory.objects.filter(backup_id=self.backup_id).delete()
            
            history_count = 0
            for i, item in enumerate(history_items):
                try:
                    url = item.get('url', '')
                    
                    if not url:
                        continue
                    
                    if BrowserHistory.objects.filter(backup_id=self.backup_id, url=url).exists():
                        continue
                    
                    BrowserHistory.objects.create(
                        backup_id=self.backup_id,
                        url=url,
                        title=item.get('title', ''),
                        visit_count=item.get('visit_count', 1),
                        last_visit_time=item.get('last_visit'),
                        source='samsung_browser'
                    )
                    
                    history_count += 1
                    
                    if i % 50 == 0 or i == total_items - 1:
                        progress = 40 + int((i / max(total_items, 1)) * 55)
                        self.update_progress(step_number, step_name, f'Saving history ({i+1}/{total_items})', progress)
                    
                except Exception as e:
                    self.log_error(f"Error saving browser history: {str(e)}")
                    continue
            
            self.log_info(f"Successfully imported {history_count} browser history items")
            self.update_progress(step_number, step_name, f'Successfully extracted {history_count} history items', 100, 'completed')
            
            return history_count
            
        except Exception as e:
            error_msg = f"Error processing browser history: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, 'failed')
            return 0
    
    def _find_browser_db(self):
        paths = [
            self._get_file_path('SBROWSER', 'SBROWSER_ext', 'History.db'),
            self._get_file_path('SBROWSER', 'SBROWSER_ext', 'backup_decrypted_ext', 'app_sbrowser', 'Default', 'History.db'),
        ]
        
        for path in paths:
            if path.exists():
                return path
        
        for pattern in ['History.db', 'history.db']:
            files = list(self.backup_root.rglob(pattern))
            if files:
                return files[0]
        
        return None
