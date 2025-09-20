import json
import logging
import os
import shutil
import tempfile
import zipfile
from collections import defaultdict
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.core.files.storage import default_storage
from django.db import models
from django.db.models import Count, Q
from django.utils import timezone
from django.utils.timezone import now
from django_filters.rest_framework import (
    CharFilter,
    DateTimeFilter,
    DjangoFilterBackend,
    FilterSet,
)
from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .extractors import (
    AppExtractor,
    BluetoothExtractor,
    BrowserExtractor,
    CallLogExtractor,
    ContactExtractor,
    FileExtractor,
    HomeScreenExtractor,
    MessageExtractor,
    WifiExtractor,
)
from .models import (
    ApkList,
    Backup,
    BackupLog,
    CallLog,
    Contact,
    File,
    Message,
    Notification,
)
from .permissions import IsBackupOwner, IsBackupOwnerOrAdmin
from .serializers import (
    BackupLogSerializer,
    BackupUploadSerializer,
    NotificationSerializer,
    BackupDetailSerializer
)
from django.db.models import Count, Q
from django.utils.timezone import now
from datetime import timedelta
from collections import defaultdict
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .utils.storage import generate_presigned_url
logger = logging.getLogger("dashboard")
import logging
import os

import requests
import  base64


class BackupFilter(FilterSet):
    name = CharFilter(lookup_expr="icontains")
    model_name = CharFilter(lookup_expr="icontains")
    status = CharFilter()
    created_after = DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = Backup
        fields = ["name", "model_name", "status", "created_at", "updated_at"]


class BackupViewSet(viewsets.ModelViewSet):
    queryset = Backup.objects.all().order_by("-created_at")
    serializer_class = BackupUploadSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = BackupFilter
    search_fields = ["name", "model_name"]
    ordering_fields = [
        "name",
        "model_name",
        "created_at",
        "updated_at",
        "size",
        "status",
    ]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BackupDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            queryset = queryset.filter(user=user)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        backup = serializer.save()

        return Response(
            {
                "message": "Backup upload started",
                "backup_id": backup.id,
                "log_id": backup.log_id,
                "status": "processing",
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        allowed_data = {}
        if "name" in request.data:
            allowed_data["name"] = request.data["name"]
        if "model_name" in request.data:
            allowed_data["model_name"] = request.data["model_name"]

        serializer = self.get_serializer(instance, data=allowed_data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        backup = self.get_object()

        try:
            if hasattr(backup, "file") and backup.file:
                if os.path.exists(backup.file.path):
                    os.remove(backup.file.path)
                    logger.info(f"Deleted backup file: {backup.file.path}")

            if hasattr(backup, "backup_file") and backup.backup_file:
                if os.path.exists(backup.backup_file.path):
                    os.remove(backup.backup_file.path)
                    logger.info(f"Deleted backup file: {backup.backup_file.path}")

            extract_dir = os.path.join(
                settings.MEDIA_ROOT, "extracted_backups", str(backup.id)
            )
            if os.path.exists(extract_dir):
                shutil.rmtree(extract_dir)
                logger.info(f"Deleted extracted files directory: {extract_dir}")

            extract_dir = os.path.join(
                settings.BACKUP_EXTRACT_PATH, f"backup_{backup.id}"
            )
            if os.path.exists(extract_dir):
                shutil.rmtree(extract_dir)
                logger.info(f"Deleted extracted files directory: {extract_dir}")

            if os.path.exists(settings.BACKUP_EXTRACT_PATH):
                for item in os.listdir(settings.BACKUP_EXTRACT_PATH):
                    if str(backup.id) in item:
                        full_path = os.path.join(settings.BACKUP_EXTRACT_PATH, item)
                        if os.path.isdir(full_path):
                            shutil.rmtree(full_path)
                            logger.info(
                                f"Deleted additional backup directory: {full_path}"
                            )

            media_dir = os.path.join(
                settings.MEDIA_ROOT, "backups", str(backup.user.id)
            )
            if os.path.exists(media_dir):
                for root, dirs, files in os.walk(media_dir):
                    for file in files:
                        if file.startswith(f"{backup.id}_") or f"_{backup.id}_" in file:
                            file_path = os.path.join(root, file)
                            os.remove(file_path)
                            logger.info(f"Deleted related media file: {file_path}")

            backup_id = backup.id
            backup.delete()

            logger.info(f"Successfully deleted backup with ID: {backup_id}")
            return Response(
                {"message": "Backup and associated data deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Exception as e:
            logger.error(f"Error deleting backup: {str(e)}")
            return Response(
                {"error": f"Failed to delete backup: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"])
    def upload_and_extract(self, request):
        logger.info("Starting backup upload and extraction")
        try:
            backup_file = request.FILES.get("backup_file")
            if not backup_file:
                logger.error("No backup file provided")
                return Response(
                    {"error": "No backup file provided"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            extract_prefix = (
                f"extracted_backups/backup_{timezone.now().strftime('%Y%m%d_%H%M%S')}"
            )
            backup_minio_path = f"{extract_prefix}/{backup_file.name}"

            default_storage.save(backup_minio_path, backup_file)

            with default_storage.open(backup_minio_path, "rb") as f:
                zip_bytes = f.read()
                with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zip_ref:
                    for member in zip_ref.namelist():
                        if not member.endswith("/"):
                            file_data = zip_ref.read(member)
                            minio_file_path = f"{extract_prefix}/{member}"
                            default_storage.save(
                                minio_file_path, ContentFile(file_data)
                            )

            serializer = self.get_serializer(
                data={
                    "name": self._get_backup_name(extract_prefix, backup_file.name),
                    "model_name": self._get_device_model(
                        extract_prefix, backup_file.name
                    ),
                    "backup_file": backup_file,
                    "size": backup_file.size,
                    "user": request.user.id,
                }
            )

            if serializer.is_valid():
                backup = serializer.save()
                stats = self._process_backup(extract_prefix, backup.id)
                return Response(
                    {
                        "message": "Backup processed successfully",
                        "backup_id": backup.id,
                        "stats": stats,
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Upload failed: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["get"])
    def stats(self, request):
        user = request.user
        queryset = self.get_queryset()

        total_backups = queryset.count()
        total_size = queryset.aggregate(total=models.Sum("size"))["total"] or 0
        total_size_gb = round(total_size / (1024**3), 2)

        status_counts = dict(
            queryset.values_list("status").annotate(count=models.Count("status"))
        )

        latest_backup = queryset.order_by("-created_at").first()
        latest_backup_data = None
        if latest_backup:
            serializer = self.get_serializer(latest_backup)
            latest_backup_data = serializer.data

        stats = {
            "total_backups": total_backups,
            "total_size_bytes": total_size,
            "total_size_gb": total_size_gb,
            "status": {
                "processing": status_counts.get("processing", 0),
                "completed": status_counts.get("completed", 0),
                "failed": status_counts.get("failed", 0),
            },
            "latest_backup": latest_backup_data,
        }

        return Response(stats)

    def _get_backup_name(self, backup_dir, default_name):
        default_name = os.path.splitext(default_name)[0]
        metadata_file = Path(backup_dir) / "metadata.json"

        if metadata_file.exists():
            try:
                with open(metadata_file) as f:
                    metadata = json.load(f)
                    if metadata.get("backup_name"):
                        return metadata["backup_name"]
            except Exception:
                pass

        return default_name

    def _get_device_model(self, backup_dir, filename):
        metadata_file = Path(backup_dir) / "metadata.json"
        if metadata_file.exists():
            try:
                with open(metadata_file) as f:
                    metadata = json.load(f)
                    if metadata.get("device_model"):
                        return metadata["device_model"]
            except Exception:
                logger.warning(f"Error reading device model from metadata file")

        clean_filename = os.path.splitext(filename)[0]

        parts = clean_filename.split("_")
        if len(parts) > 0:
            first_part = parts[0]
            if (
                first_part.startswith("SM-")
                or first_part.startswith("GT-")
                or "-" in first_part
            ):
                return first_part

        folder_name = os.path.basename(backup_dir)
        if folder_name.startswith("backup_"):
            return ""

        parts = folder_name.split("_")
        if len(parts) > 0:
            first_part = parts[0]
            if (
                first_part.startswith("SM-")
                or first_part.startswith("GT-")
                or "-" in first_part
            ):
                return first_part

        return ""

    def _process_backup(self, extract_dir, backup_id):
        stats = {}
        extractors = [
            ("contacts", ContactExtractor(extract_dir, backup_id)),
            ("call_logs", CallLogExtractor(extract_dir, backup_id)),
            ("messages", MessageExtractor(extract_dir, backup_id)),
            ("apps", AppExtractor(extract_dir, backup_id)),
            ("bluetooth", BluetoothExtractor(extract_dir, backup_id)),
            ("wifi", WifiExtractor(extract_dir, backup_id)),
            ("browser", BrowserExtractor(extract_dir, backup_id)),
            ("files", FileExtractor(extract_dir, backup_id)),
            ("home_screen", HomeScreenExtractor(extract_dir, backup_id)),
        ]

        for name, extractor in extractors:
            try:
                count = extractor.extract()
                stats[name] = {"count": count}
                logger.info(f"Extracted {count} {name}")
            except Exception as e:
                logger.error(f"Error extracting {name}: {str(e)}")
                stats[name] = {"error": str(e)}

        return stats


class BackupProgressView(RetrieveAPIView):
    queryset = BackupLog.objects.all()
    serializer_class = BackupLogSerializer
    lookup_field = "pk"
    permission_classes = [IsAuthenticated, IsBackupOwner]

    def retrieve(self, request, *args, **kwargs):
        log = self.get_object()
        serializer = self.get_serializer(log)
        data = serializer.data

        steps_info = []
        if log.steps_data:
            for step_num in range(1, log.total_steps + 1):
                step_key = f"step_{step_num}"
                if step_key in log.steps_data:
                    step_data = log.steps_data[step_key]
                    steps_info.append(
                        {
                            "step_number": step_num,
                            "name": step_data.get("name", ""),
                            "description": step_data.get("description", ""),
                            "progress_percent": step_data.get("progress_percent", 0),
                            "status": step_data.get("status", "pending"),
                            "timestamp": step_data.get("timestamp", ""),
                        }
                    )

        return Response(data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)

        if self.request.query_params.get("all") == "true":
            return queryset

        return queryset.filter(is_seen=False)

    @action(detail=True, methods=["post"])
    def mark_as_seen(self, request, pk=None):
        notification = self.get_object()
        if notification.user != request.user:
            return Response({"detail": "Forbidden"}, status=403)

        notification.is_seen = True
        notification.save()
        return Response({"detail": "Marked as seen"})

    @action(detail=False, methods=["post"])
    def mark_all_as_seen(self, request):
        Notification.objects.filter(user=request.user, is_seen=False).update(
            is_seen=True
        )
        return Response({"detail": "All notifications marked as seen"})

    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request):
        queryset = Notification.objects.filter(user=request.user)
        filtered = self.filter_queryset(queryset)
        page = self.paginate_queryset(filtered)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(filtered, many=True)
        return Response(serializer.data)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        backups = Backup.objects.filter(user=user)
        backup_ids = backups.values_list("id", flat=True)

        phone_models = (
            backups.values("model_name")
            .annotate(upload_count=Count("id"))
            .order_by("-upload_count")
        )
        phone_models_data = [
            {"device_name": entry["model_name"], "upload_count": entry["upload_count"]}
            for entry in phone_models
        ]

        top_calls = (
            CallLog.objects.filter(backup_id__in=backup_ids)
            .values("contact__name", "backup__model_name")
            .annotate(call_count=Count("id"))
            .filter(contact__name__isnull=False)
            .order_by("-call_count")[:5]
        )
        frequently_called_contacts = [
            {
                "name": item["contact__name"],
                "phone_model": item["backup__model_name"],
                "call_count": item["call_count"],
            }
            for item in top_calls
        ]

        messages_count = Message.objects.filter(backup_id__in=backup_ids).count()

        apps_count = ApkList.objects.filter(backup_id__in=backup_ids).count()

        contacts_count = Contact.objects.filter(backup_id__in=backup_ids).count()

        calls_count = CallLog.objects.filter(backup_id__in=backup_ids).count()

        files = File.objects.filter(backup_id__in=backup_ids)
        medias = {
            "videos_count": files.filter(category="video").count(),
            "images_count": files.filter(category="image").count(),
            "musics_count": files.filter(category="music").count(),
            "others": files.exclude(category__in=["video", "image", "music"]).count(),
        }

        days_back = 60
        recent_backups = backups.filter(
            created_at__gte=now() - timedelta(days=days_back)
        )
        delta_days = (
            (
                now().date()
                - recent_backups.order_by("created_at").first().created_at.date()
            ).days
            if recent_backups.exists()
            else 0
        )

        if delta_days <= 30:
            uploads_overview = (
                recent_backups.extra({"day": "DATE(created_at)"})
                .values("day")
                .annotate(count=Count("id"))
                .order_by("day")
            )
            overview = [
                {"date": str(entry["day"]), "count": entry["count"]}
                for entry in uploads_overview
            ]
        else:
            uploads_overview = (
                recent_backups.extra({"month": "strftime('%%Y-%%m', created_at)"})
                .values("month")
                .annotate(count=Count("id"))
                .order_by("month")
            )
            overview = [
                {"date": entry["month"], "count": entry["count"]}
                for entry in uploads_overview
            ]

        return Response(
            {
                "phone_models": phone_models_data,
                "frequently_called_contacts": frequently_called_contacts,
                "messages_count": messages_count,
                "apps_count": apps_count,
                "contacts_count": contacts_count,
                "calls_count": calls_count,
                "medias": medias,
                "uploads_overview": overview,
            }
        )


class BackupstatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        backups = Backup.objects.filter(user=user)
        total_count = backups.count()
        total_size = backups.aggregate(total=models.Sum("size"))["total"] or 0
        completed_count = backups.filter(status="completed").count()
        failed_count = backups.filter(status="failed").count()

        return Response(
            {
                "total_backups": total_count,
                "total_size_bytes": total_size,
                "completed_backups": completed_count,
                "failed_backups": failed_count,
            }
        )

class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            file_obj = File.objects.get(pk=pk)

            if not request.user.is_staff and file_obj.backup.user != request.user:
                return Response(
                    {"message": "You do not have permission to perform this action."},
                    status=status.HTTP_403_FORBIDDEN
                )

            download_url = file_obj.file.url
            absolute_url = request.build_absolute_uri(download_url)

            if not absolute_url:
                return Response(
                    {"error": "Could not generate download link."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response(
                {'download_url': absolute_url},
                status=status.HTTP_200_OK
            )

        except File.DoesNotExist:
            return Response(
                {"error": "File not found."},
                status=status.HTTP_404_NOT_FOUND
            )
