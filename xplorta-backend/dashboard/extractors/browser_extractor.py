import json
import logging
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

from ..models import (
    BrowserBookmark,
    BrowserDownload,
    BrowserHistory,
    BrowserSearch,
    BrowserTab,
    File,
)
from .base_extractor import BaseExtractor

logger = logging.getLogger(__name__)


class BrowserExtractor(BaseExtractor):
    def extract(self) -> int:
        step_number = 13
        step_name = "browser"

        self.log_info("Starting browser data extraction...")
        self.update_progress(
            step_number, step_name, "Starting browser data extraction", 0
        )

        history_count = self._extract_history(step_number, step_name)

        self.update_progress(
            step_number,
            step_name,
            f"Extracted {history_count} browser history items",
            40,
        )

        bookmark_count = self._extract_bookmarks(step_number, step_name)

        self.update_progress(
            step_number, step_name, f"Extracted {bookmark_count} browser bookmarks", 70
        )

        download_count, tab_count = self._extract_downloads_tabs(step_number, step_name)

        total_count = history_count + bookmark_count + download_count + tab_count

        self.update_progress(
            step_number,
            step_name,
            f"Successfully imported {total_count} browser items in total",
            100,
            "completed",
        )

        self.log_info(f"Successfully imported {total_count} browser items in total")
        self.extracted_count = total_count

        return total_count

    def _extract_history(self, step_number, step_name) -> int:
        self.log_info("Processing browser history...")
        self.update_progress(step_number, step_name, "Processing browser history...", 5)

        history_count = 0
        search_count = 0

        history_db = self._get_file_path(
            "SBROWSER",
            "SBROWSER_ext",
            "backup_decrypted_ext",
            "app_sbrowser",
            "Default",
            "History.db",
        )

        if not history_db.exists():
            self.log_debug("Browser history database not found")
            self.update_progress(
                step_number, step_name, "Browser history database not found", 10
            )
            return 0

        try:
            conn = sqlite3.connect(history_db)
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT urls.url, 
                       urls.title,
                       urls.visit_count,
                       urls.typed_count,
                       urls.last_visit_time,
                       urls.hidden
                FROM urls
                WHERE urls.last_visit_time > 0
                ORDER BY urls.last_visit_time DESC
            """
            )

            rows = cursor.fetchall()
            total_history = len(rows)
            self.log_info(f"Found {total_history} history entries")

            for i, row in enumerate(rows):
                try:
                    url, title, visit_count, typed_count, last_visit_time, hidden = row

                    if last_visit_time:
                        delta = datetime(1601, 1, 1, tzinfo=timezone.utc)
                        visit_date = delta + timedelta(microseconds=last_visit_time)
                    else:
                        visit_date = None

                    BrowserHistory.objects.create(
                        backup_id=self.backup_id,
                        url=url,
                        title=title,
                        visit_count=visit_count,
                        typed_count=typed_count,
                        last_visit_time=visit_date,
                        hidden=(hidden == 1),
                        source="history",
                    )

                    history_count += 1

                    if i % 50 == 0 or i == total_history - 1:
                        progress = min(5 + int((i / total_history) * 15), 20)
                        self.update_progress(
                            step_number,
                            step_name,
                            f"Processing history entries ({i+1}/{total_history})",
                            progress,
                        )

                except Exception as e:
                    self.log_error(f"Error processing history item: {str(e)}")
                    continue

            cursor.execute(
                """
                SELECT keyword_search_terms.term,
                       urls.last_visit_time
                FROM keyword_search_terms
                JOIN urls ON keyword_search_terms.url_id = urls.id
                ORDER BY urls.last_visit_time DESC
            """
            )

            search_rows = cursor.fetchall()
            total_searches = len(search_rows)
            self.log_info(f"Found {total_searches} search entries")

            for i, row in enumerate(search_rows):
                try:
                    search_term, time_msec = row

                    if time_msec:
                        search_time = datetime.fromtimestamp(time_msec / 1000)
                    else:
                        search_time = None

                    BrowserSearch.objects.create(
                        backup_id=self.backup_id,
                        search_term=search_term,
                        search_time=search_time,
                        search_engine="samsung_browser",
                    )

                    search_count += 1

                    if i % 20 == 0 or i == total_searches - 1:
                        progress = min(20 + int((i / total_searches) * 10), 30)
                        self.update_progress(
                            step_number,
                            step_name,
                            f"Processing search entries ({i+1}/{total_searches})",
                            progress,
                        )

                except Exception as e:
                    self.log_error(f"Error processing search term: {str(e)}")
                    continue

            conn.close()

            self.log_info(
                f"Successfully imported {history_count} history items and {search_count} search terms"
            )

            self.update_progress(
                step_number,
                step_name,
                f"Extracted {history_count} history items and {search_count} search terms",
                30,
            )

            return history_count + search_count

        except Exception as e:
            error_msg = f"Error accessing browser history database: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 10, "failed")
            return 0

    def _extract_bookmarks(self, step_number, step_name) -> int:
        self.log_info("Processing browser bookmarks...")
        self.update_progress(
            step_number, step_name, "Processing browser bookmarks...", 40
        )

        bookmark_count = 0

        bookmarks_db = self._get_file_path(
            "SBROWSER",
            "SBROWSER_ext",
            "backup_decrypted_ext",
            "app_sbrowser",
            "Default",
            "Bookmarks.db",
        )

        if not bookmarks_db.exists():
            self.log_debug("Browser bookmarks database not found")
            return 0

        try:
            conn = sqlite3.connect(bookmarks_db)
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT bookmark_node.url,
                       bookmark_node.title,
                       bookmark_node.date_added,
                       bookmark_node.date_modified,
                       bookmark_node.favicon_url
                FROM bookmark_node
                WHERE bookmark_node.type = 1
                ORDER BY bookmark_node.date_added DESC
            """
            )

            rows = cursor.fetchall()
            total_bookmarks = len(rows)
            self.log_info(f"Found {total_bookmarks} bookmarks")

            for i, row in enumerate(rows):
                try:
                    url, title, date_added, date_modified, favicon_url = row

                    if date_added:
                        delta = datetime(1601, 1, 1, tzinfo=timezone.utc)
                        added_date = delta + timedelta(microseconds=date_added)
                    else:
                        added_date = None

                    if date_modified:
                        delta = datetime(1601, 1, 1, tzinfo=timezone.utc)
                        modified_date = delta + timedelta(microseconds=date_modified)
                    else:
                        modified_date = None

                    BrowserBookmark.objects.create(
                        backup_id=self.backup_id,
                        url=url,
                        title=title,
                        date_added=added_date,
                        date_modified=modified_date,
                        favicon_url=favicon_url,
                    )

                    bookmark_count += 1

                    if i % 20 == 0 or i == total_bookmarks - 1:
                        progress = min(40 + int((i / total_bookmarks) * 20), 60)
                        self.update_progress(
                            step_number,
                            step_name,
                            f"Processing bookmarks ({i+1}/{total_bookmarks})",
                            progress,
                        )

                except Exception as e:
                    self.log_error(f"Error processing bookmark: {str(e)}")
                    continue

            conn.close()

            self.log_info(f"Successfully imported {bookmark_count} bookmarks")
            self.update_progress(
                step_number, step_name, f"Extracted {bookmark_count} bookmarks", 60
            )

            return bookmark_count

        except Exception as e:
            error_msg = f"Error accessing browser bookmarks database: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 50, "failed")
            return 0

    def _extract_downloads_tabs(self, step_number, step_name) -> tuple:
        self.log_info("Processing browser downloads and tabs...")
        self.update_progress(
            step_number, step_name, "Processing browser downloads and tabs...", 70
        )

        download_count = 0
        tab_count = 0

        downloads_json = self._get_file_path(
            "SBROWSER",
            "SBROWSER_ext",
            "backup_decrypted_ext",
            "app_sbrowser",
            "Default",
            "Downloads.json",
        )
        tabs_json = self._get_file_path(
            "SBROWSER",
            "SBROWSER_ext",
            "backup_decrypted_ext",
            "app_sbrowser",
            "Default",
            "Current Tabs.json",
        )

        if downloads_json.exists():
            try:
                with open(downloads_json, "r", encoding="utf-8") as f:
                    downloads_data = json.load(f)
                    downloads_list = downloads_data.get("downloads", [])
                    total_downloads = len(downloads_list)
                    self.log_info(f"Found {total_downloads} downloads")

                for i, download in enumerate(downloads_list):
                    try:
                        url = download.get("url")
                        target_path = download.get("target_path")
                        mime_type = download.get("mime_type")

                        start_time = None
                        end_time = None

                        if "start_time" in download:
                            try:
                                start_time = datetime.fromtimestamp(
                                    download["start_time"]
                                )
                            except:
                                pass

                        if "end_time" in download:
                            try:
                                end_time = datetime.fromtimestamp(download["end_time"])
                            except:
                                pass

                        file_obj = None
                        if target_path:
                            file_name = Path(target_path).name
                            file_obj = File.objects.create(
                                backup_id=self.backup_id,
                                file_name=file_name,
                                file_size=download.get("received_bytes", 0),
                                file_path=target_path,
                                source="browser_download",
                            )

                        BrowserDownload.objects.create(
                            backup_id=self.backup_id,
                            url=url,
                            file_name=Path(target_path).name if target_path else "",
                            file=file_obj,
                            mime_type=mime_type,
                            total_bytes=download.get("total_bytes", 0),
                            received_bytes=download.get("received_bytes", 0),
                            state=download.get("state", ""),
                            danger_type=download.get("danger_type", ""),
                            start_time=start_time,
                            end_time=end_time,
                        )

                        download_count += 1

                        if i % 5 == 0 or i == total_downloads - 1:
                            progress = min(
                                70 + int((i / max(total_downloads, 1)) * 15), 85
                            )
                            self.update_progress(
                                step_number,
                                step_name,
                                f"Processing downloads ({i+1}/{total_downloads})",
                                progress,
                            )

                    except Exception as e:
                        self.log_error(f"Error processing download: {str(e)}")
                        continue

            except Exception as e:
                self.log_error(f"Error reading downloads file: {str(e)}")
        else:
            self.log_debug("Browser downloads file not found")

        if tabs_json.exists():
            try:
                with open(tabs_json, "r", encoding="utf-8") as f:
                    tabs_data = json.load(f)
                    tabs_list = tabs_data.get("current_tabs", [])
                    total_tabs = len(tabs_list)
                    self.log_info(f"Found {total_tabs} open tabs")

                for i, tab in enumerate(tabs_list):
                    try:
                        url = tab.get("url")
                        title = tab.get("title")

                        if not url:
                            continue

                        BrowserTab.objects.create(
                            backup_id=self.backup_id,
                            url=url,
                            title=title,
                            favicon_url=tab.get("favicon_url"),
                        )

                        tab_count += 1

                        if i % 3 == 0 or i == total_tabs - 1:
                            progress = min(85 + int((i / max(total_tabs, 1)) * 10), 95)
                            self.update_progress(
                                step_number,
                                step_name,
                                f"Processing open tabs ({i+1}/{total_tabs})",
                                progress,
                            )

                    except Exception as e:
                        self.log_error(f"Error processing tab: {str(e)}")
                        continue

            except Exception as e:
                self.log_error(f"Error reading tabs file: {str(e)}")
        else:
            self.log_debug("Browser tabs file not found")

        self.log_info(
            f"Successfully imported {download_count} downloads and {tab_count} tabs"
        )
        return download_count, tab_count
