import logging
import os
from abc import ABC, abstractmethod
from pathlib import Path

from ..progress_manager import ProgressManager

logger = logging.getLogger("dashboard.extractors")


class BaseExtractor(ABC):
    def __init__(self, backup_dir: str, backup_id: int):
        self.backup_dir = Path(backup_dir)
        self.backup_id = backup_id
        self.extracted_count = 0
        self.logger = logging.getLogger("dashboard.extractors")
        self.backup_root = self._find_backup_root()
        self.log = self._get_log()

    def _get_log(self):
        try:
            from dashboard.models import Backup, BackupLog

            backup = Backup.objects.get(id=self.backup_id)
            return backup.logs.first()
        except:
            return None

    def _find_backup_root(self) -> Path:
        contents = list(self.backup_dir.iterdir())

        device_folders = [
            item for item in contents if item.is_dir() and not item.name.startswith(".")
        ]

        if device_folders:
            self.logger.info(f"Found device folder: {device_folders[0]}")
            return device_folders[0]

        self.logger.warning("No device folder found, using backup dir directly")
        return self.backup_dir

    @abstractmethod
    def extract(self) -> int:
        pass

    def _get_file_path(self, *parts) -> Path:
        return self.backup_root.joinpath(*parts)

    def _log_progress(self, message: str):
        self.logger.info(f"[Backup {self.backup_id}] {message}")

    def _log_error(self, message: str, error: Exception = None):
        if error:
            self.logger.error(f"[Backup {self.backup_id}] {message}: {str(error)}")
        else:
            self.logger.error(f"[Backup {self.backup_id}] {message}")

    def normalize_phone_number(self, phone: str) -> str:
        if not phone:
            return ""
        digits_only = "".join(filter(str.isdigit, phone))
        if digits_only.startswith("98"):
            digits_only = "0" + digits_only[2:]
        if digits_only.startswith("0"):
            digits_only = digits_only[1:]
        return digits_only

    def log_info(self, message: str):
        self.logger.info(f"[Backup {self.backup_id}] {message}")

    def log_debug(self, message: str):
        self.logger.debug(f"[Backup {self.backup_id}] {message}")

    def log_error(self, message: str, exc_info=True):
        self.logger.error(f"[Backup {self.backup_id}] {message}", exc_info=exc_info)
        
    def log_warning(self, message: str):
        self.logger.warning(f"[Backup {self.backup_id}] {message}")

    def update_progress(
        self,
        step_number,
        step_name,
        description,
        progress_percent=0,
        status="processing",
    ):
        if self.log:
            return ProgressManager.update_step(
                self.log.id,
                step_number,
                step_name,
                description,
                progress_percent,
                status,
            )
        return None

    def mark_step_complete(self, step_number, step_name, description="Step completed"):
        if self.log:
            return ProgressManager.mark_step_complete(
                self.log.id, step_number, step_name, description
            )
        return None

    def mark_step_failed(self, step_number, step_name, error_message):
        if self.log:
            return ProgressManager.mark_step_failed(
                self.log.id, step_number, step_name, error_message
            )
        return None
