import json
import logging
import os
import sqlite3
import traceback
from datetime import datetime
from pathlib import Path

from django.db import transaction
from django.utils.timezone import make_aware

from ..models import ChatThread, Contact, Message
from .base_extractor import BaseExtractor

logger = logging.getLogger(__name__)


def normalize_phone_number(number):
    if not number:
        return number
    return "".join(filter(str.isdigit, str(number)))


def clean_text(text):
    if not text:
        return ""
    cleaned = text.replace("\x00", "")
    if cleaned != text:
        logger.debug(
            f"Removed NULL bytes from message text: {len(text) - len(cleaned)} bytes removed"
        )
    return cleaned


class MessageExtractor(BaseExtractor):
    def extract(self) -> int:
        step_number = 8
        step_name = "messages"

        json_message_file = self._find_json_message_file()
        if json_message_file:
            return self._extract_from_json(json_message_file, step_number, step_name)

        db_message_file = self._find_sqlite_message_file()
        if db_message_file:
            return self._extract_from_sqlite(db_message_file, step_number, step_name)

        self.update_progress(
            step_number, step_name, "Message file not found", 0, "failed"
        )
        self.log_error("Message file not found in backup")
        return 0

    def _find_json_message_file(self):
        json_patterns = [
            "!@ssm@!sms_restore_decrypted.bk",
            "sms_restore_decrypted.bk",
            "sms_restore.json",
        ]

        for pattern in json_patterns:
            paths = [
                Path(self.backup_root)
                / "MESSAGE"
                / "Message_ext"
                / "!@ssm@!MESSAGE_JSON_ext"
                / pattern,
                Path(self.backup_root) / "MESSAGE" / "Message_ext" / pattern,
                Path(self.backup_root) / "MESSAGE" / pattern,
                Path(self.backup_root) / pattern,
            ]
            for path in paths:
                if path.exists():
                    self.log_info(f"Found JSON message file: {path}")
                    return path

        for root, _, files in os.walk(self.backup_root):
            for file in files:
                if (
                    file.lower()
                    in ["!@ssm@!sms_restore_decrypted.bk", "sms_restore_decrypted.bk"]
                    or "sms_restore" in file.lower()
                    and (file.lower().endswith(".bk") or file.lower().endswith(".json"))
                ):
                    file_path = Path(os.path.join(root, file))
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read(100)
                            if content.strip().startswith("[") or '"_id"' in content:
                                self.log_info(
                                    f"Found JSON message file through recursive search: {file_path}"
                                )
                                return file_path
                    except:
                        continue

        return None

    def _find_sqlite_message_file(self):
        db_patterns = [
            "mmssms.db",
            "sms_restore.db",
            "sms_restore_decrypted.db",
            "sms.db",
            "messages.db",
        ]

        for pattern in db_patterns:
            paths = [
                Path(self.backup_root)
                / "MESSAGE"
                / "Message_ext"
                / "!@ssm@!Message_decrypted_ext"
                / "databases_backup"
                / pattern,
                Path(self.backup_root)
                / "MESSAGE"
                / "Message_ext"
                / "databases_backup"
                / pattern,
                Path(self.backup_root) / "MESSAGE" / "databases_backup" / pattern,
                Path(self.backup_root) / "MESSAGE" / pattern,
                Path(self.backup_root) / pattern,
            ]
            for path in paths:
                if path.exists():
                    self.log_info(f"Found SQLite message file: {path}")
                    return path

        for root, _, files in os.walk(self.backup_root):
            for file in files:
                if file.lower() in db_patterns:
                    file_path = Path(os.path.join(root, file))
                    self.log_info(
                        f"Found SQLite message file through recursive search: {file_path}"
                    )
                    return file_path

        return None

    def _extract_from_json(self, json_file, step_number, step_name):
        self.log_info(f"Starting message extraction from JSON file: {json_file}")
        self.update_progress(
            step_number, step_name, "Starting message extraction from JSON", 10
        )

        message_count = 0
        thread_count = 0
        threads_cache = {}
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                content = f.read()

                try:
                    messages = json.loads(content)
                    if not isinstance(messages, list):
                        messages = [messages]
                except json.JSONDecodeError as e:
                    self.log_error(f"JSON decode error: {str(e)}")
                    content = content.strip()
                    if not content.startswith("["):
                        content = "[" + content + "]"
                    try:
                        messages = json.loads(content)
                    except json.JSONDecodeError as e2:
                        self.log_error(
                            f"Failed to parse JSON even after fixing: {str(e2)}"
                        )
                        return 0

                total_messages = len(messages)
                self.log_info(f"Found {total_messages} messages in JSON file")

                self.log_info("Loading contacts for message matching")
                contacts = {}
                for contact in Contact.objects.filter(backup_id=self.backup_id):
                    if contact.phone_number:
                        normalized_number = normalize_phone_number(contact.phone_number)
                        contacts[normalized_number] = contact.id

                self.update_progress(
                    step_number, step_name, "Loaded contacts for matching", 30
                )

                with transaction.atomic():
                    for i, msg_data in enumerate(messages):
                        try:
                            address = msg_data.get("address")
                            if not address:
                                continue

                            thread_id = msg_data.get("thread_id")
                            body = clean_text(msg_data.get("body", ""))
                            date_timestamp = msg_data.get("date")

                            date = None
                            try:
                                if date_timestamp:
                                    timestamp = int(date_timestamp)
                                    if timestamp > 10**10:
                                        timestamp = timestamp / 1000
                                    date = make_aware(datetime.fromtimestamp(timestamp))
                            except (ValueError, TypeError, OSError):
                                date = None

                            try:
                                msg_type = int(msg_data.get("type", 0))
                            except (ValueError, TypeError):
                                msg_type = 0

                            try:
                                status = int(msg_data.get("status", -1))
                            except (ValueError, TypeError):
                                status = -1

                            seen = (
                                msg_data.get("seen") == "1"
                                or msg_data.get("seen") is True
                            )

                            try:
                                sim_slot = int(msg_data.get("sim_slot", 0))
                            except (ValueError, TypeError):
                                sim_slot = 0
                            normalized_address = normalize_phone_number(address)
                            contact_id = contacts.get(normalized_address)

                            thread_key = f"{address}"
                            if thread_key not in threads_cache:
                                chat_thread, created = ChatThread.objects.get_or_create(
                                    backup_id=self.backup_id,
                                    address=address,
                                    defaults={
                                        "contact_id": contact_id,
                                    },
                                )
                                threads_cache[thread_key] = chat_thread.id
                                if created:
                                    thread_count += 1
                            chat_thread_id = threads_cache[thread_key]
                            message = Message.objects.create(
                                backup_id=self.backup_id,
                                chat_thread_id=chat_thread_id,
                                date=date,
                                body=body,
                                status=status,
                                seen=seen,
                                sim_slot=sim_slot,
                            )

                            message_count += 1

                            if message_count % 100 == 0:
                                progress = min(
                                    90, 30 + (message_count / total_messages) * 60
                                )
                                self.update_progress(
                                    step_number,
                                    step_name,
                                    f"Processing message {message_count}/{total_messages}",
                                    int(progress),
                                )

                        except Exception as e:
                            self.log_error(f"Error processing message {i}: {str(e)}")
                            continue

                self.log_info(
                    f"Successfully imported {message_count} messages in {thread_count} conversation threads from JSON"
                )
                self.update_progress(
                    step_number,
                    step_name,
                    f"Successfully extracted {message_count} messages in {thread_count} threads from JSON",
                    100,
                    "completed",
                )

                return message_count

        except Exception as e:
            error_msg = f"Error reading JSON message file: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, "failed")
            return 0

    def _extract_from_sqlite(self, db_file, step_number, step_name):
        self.log_info(f"Starting message extraction from SQLite database: {db_file}")
        self.update_progress(
            step_number, step_name, "Starting message extraction from database", 10
        )

        message_count = 0
        thread_count = 0
        threads_cache = {}

        try:
            conn = sqlite3.connect(str(db_file))
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            self.update_progress(
                step_number, step_name, "Connected to message database", 20
            )

            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='sms'"
            )
            if not cursor.fetchone():
                self.log_error("SMS table not found in database")
                conn.close()
                self.update_progress(
                    step_number,
                    step_name,
                    "SMS table not found in database",
                    0,
                    "failed",
                )
                return 0

            cursor.execute("PRAGMA table_info(sms)")
            columns = [row[1] for row in cursor.fetchall()]
            self.log_info(f"SMS table columns: {columns}")

            self.log_info("Loading contacts for message matching")
            contacts = {}
            for contact in Contact.objects.filter(backup_id=self.backup_id):
                if contact.phone_number:
                    normalized_number = normalize_phone_number(contact.phone_number)
                    contacts[normalized_number] = contact.id

            self.update_progress(
                step_number, step_name, "Loaded contacts for matching", 30
            )

            cursor.execute("SELECT COUNT(*) FROM sms")
            total_messages = cursor.fetchone()[0]
            self.log_info(f"Found {total_messages} messages in database")

            query = """
            SELECT _id, thread_id, address, date, date_sent, body, type, status, 
                   read, seen, protocol, reply_path_present, service_center,
                   locked, error_code, sub_id, creator, deletable, sim_slot,
                   sim_imsi, hidden, app_id, msg_id, reserved, pri,
                   teleservice_id, svc_cmd, roam_pending, spam_report,
                   secret_mode, safe_message, favorite, d_rpt_cnt,
                   using_mode, announcements_subtype, correlation_tag,
                   bin_info, re_type
            FROM sms 
            ORDER BY date ASC
            """

            cursor.execute(query)

            self.update_progress(
                step_number, step_name, "Processing messages from database", 40
            )

            with transaction.atomic():
                for i, row in enumerate(cursor.fetchall()):
                    try:
                        address = row["address"]
                        if not address:
                            continue

                        thread_id = row["thread_id"]
                        body = clean_text(row["body"]) if row["body"] else ""
                        date_timestamp = row["date"]

                        try:
                            if date_timestamp:
                                date_seconds = int(date_timestamp) / 1000
                                date = make_aware(datetime.fromtimestamp(date_seconds))
                            else:
                                date = None
                        except (ValueError, TypeError, OSError):
                            date = None

                        try:
                            msg_type = int(row["type"]) if row["type"] else 0
                        except (ValueError, TypeError):
                            msg_type = 0

                        try:
                            status = (
                                int(row["status"]) if row["status"] is not None else -1
                            )
                        except (ValueError, TypeError):
                            status = -1

                        seen = bool(row["seen"]) if row["seen"] is not None else False

                        try:
                            sim_slot = (
                                int(row["sim_slot"])
                                if row["sim_slot"] is not None
                                else 0
                            )
                        except (ValueError, TypeError):
                            sim_slot = 0
                            normalized_address = normalize_phone_number(address)
                        contact_id = contacts.get(normalized_address)

                        thread_key = f"{address}"
                        if thread_key not in threads_cache:
                            chat_thread, created = ChatThread.objects.get_or_create(
                                backup_id=self.backup_id,
                                address=address,
                                defaults={"contact_id": contact_id},
                            )
                            threads_cache[thread_key] = chat_thread.id
                            if created:
                                thread_count += 1
                        chat_thread_id = threads_cache[thread_key]

                        message = Message.objects.create(
                            backup_id=self.backup_id,
                            chat_thread_id=chat_thread_id,
                            date=date,
                            body=body,
                            status=status,
                            seen=seen,
                            sim_slot=sim_slot,
                        )

                        message_count += 1

                        if message_count % 100 == 0:
                            progress = 40 + (message_count * 50 // total_messages)
                            self.update_progress(
                                step_number,
                                step_name,
                                f"Processing messages from database ({message_count}/{total_messages})",
                                progress,
                            )

                    except Exception as e:
                        self.log_error(f"Error processing message row {i}: {str(e)}")
                        continue

            conn.close()

            self.log_info(
                f"Successfully imported {message_count} messages in {thread_count} conversation threads from database"
            )
            self.update_progress(
                step_number,
                step_name,
                f"Successfully extracted {message_count} messages in {thread_count} threads from database",
                100,
                "completed",
            )

            return message_count

        except sqlite3.Error as e:
            error_msg = f"SQLite database error: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, "failed")
            return 0

        except Exception as e:
            error_msg = f"Error reading message database: {str(e)}"
            self.log_error(error_msg)
            self.update_progress(step_number, step_name, error_msg, 0, "failed")
            self.log_error(traceback.format_exc())
            return 0
