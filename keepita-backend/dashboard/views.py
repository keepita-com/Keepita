import base64
import io
import json
import logging
import os
import shutil
import tempfile
import threading
import uuid
import zipfile
from collections import defaultdict
from datetime import timedelta
from pathlib import Path

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import models
from django.db.models import Count, Q
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.timezone import now
from django_filters.rest_framework import (CharFilter, DateTimeFilter,
                                           DjangoFilterBackend, FilterSet)
from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (ApkList, AsyncTask, Backup, BackupLog, CallLog,
                     ClientInstance, Contact, DecryptedFile, File, Message,
                     Notification)
from .permissions import (HasValidClientApiKey, IsBackupOwner,
                          IsBackupOwnerOrAdmin)
from .serializers import (BackupDetailSerializer, BackupLogSerializer,
                          BackupUploadSerializer, ClientInstanceSerializer,
                          ClientRegistrationSerializer, NotificationSerializer)
from .utils.storage import generate_presigned_url
from .data_handlers import save_extracted_data

logger = logging.getLogger(__name__)

from rest_framework.renderers import BaseRenderer

class BackupFilter(FilterSet):
    name = CharFilter(lookup_expr='icontains')
    model_name = CharFilter(lookup_expr='icontains')
    status = CharFilter()
    created_after = DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Backup
        fields = ['name', 'model_name', 'status', 'created_at', 'updated_at']

class BackupViewSet(viewsets.ModelViewSet):
    queryset = Backup.objects.all().order_by('-created_at')
    serializer_class = BackupUploadSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BackupFilter
    search_fields = ['name', 'model_name']
    ordering_fields = ['name', 'model_name', 'created_at', 'updated_at', 'size', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BackupDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        
        queryset = self.queryset.all()  
        
        
        if getattr(self, 'swagger_fake_view', False):
            return queryset.none()

        user = getattr(self.request, 'user', None)

        if user and user.is_authenticated:
            if not user.is_staff:
                
                queryset = queryset.filter(user=user)
            
        else:
            
            
            queryset = queryset.none()
            
        return queryset
        

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        backup = serializer.save()
        
        return Response({
            'message': 'Backup upload started',
            'backup_id': backup.id,
            'log_id': backup.log_id,
            'status': 'processing'
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        allowed_data = {}
        if 'name' in request.data:
            allowed_data['name'] = request.data['name']
        if 'model_name' in request.data:
            allowed_data['model_name'] = request.data['model_name']
            
        serializer = self.get_serializer(instance, data=allowed_data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        backup = self.get_object()
        
        try:
            if hasattr(backup, 'file') and backup.file:
                if os.path.exists(backup.file.path):
                    os.remove(backup.file.path)
                    logger.info(f"Deleted backup file: {backup.file.path}")
                    
            if hasattr(backup, 'backup_file') and backup.backup_file:
                if os.path.exists(backup.backup_file.path):
                    os.remove(backup.backup_file.path)
                    logger.info(f"Deleted backup file: {backup.backup_file.path}")
            
            extract_dir = os.path.join(settings.MEDIA_ROOT, 'extracted_backups', str(backup.id))
            if os.path.exists(extract_dir):
                shutil.rmtree(extract_dir)
                logger.info(f"Deleted extracted files directory: {extract_dir}")
            
            extract_dir = os.path.join(settings.BACKUP_EXTRACT_PATH, f"backup_{backup.id}")
            if os.path.exists(extract_dir):
                shutil.rmtree(extract_dir)
                logger.info(f"Deleted extracted files directory: {extract_dir}")
            
            if os.path.exists(settings.BACKUP_EXTRACT_PATH):
                for item in os.listdir(settings.BACKUP_EXTRACT_PATH):
                    if str(backup.id) in item:
                        full_path = os.path.join(settings.BACKUP_EXTRACT_PATH, item)
                        if os.path.isdir(full_path):
                            shutil.rmtree(full_path)
                            logger.info(f"Deleted additional backup directory: {full_path}")
            
            media_dir = os.path.join(settings.MEDIA_ROOT, 'backups', str(backup.user.id))
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
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            logger.error(f"Error deleting backup: {str(e)}")
            return Response(
                {"error": f"Failed to delete backup: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def upload_and_extract(self, request):
        logger.info("Starting backup upload and extraction")
        try:
            backup_file = request.FILES.get('backup_file')
            if not backup_file:
                logger.error("No backup file provided")
                return Response(
                    {'error': 'No backup file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            device_brand = request.data.get('device_brand', 'samsung')
            if device_brand not in ['samsung', 'xiaomi', 'ios']:
                return Response(
                    {'error': 'Invalid device_brand. Must be samsung, xiaomi, or ios.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            extract_prefix = f"extracted_backups/backup_{timezone.now().strftime('%Y%m%d_%H%M%S')}"
            backup_minio_path = f"{extract_prefix}/{backup_file.name}"
            default_storage.save(backup_minio_path, backup_file)

            serializer = self.get_serializer(data={
                'name': os.path.splitext(backup_file.name)[0],
                'model_name': request.data.get('model_name', 'Unknown'),
                'device_brand': device_brand,
                'backup_file': backup_file,
                'size': backup_file.size,
                'user': request.user.id
            })

            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            backup = serializer.save()
            
            stats = {}
            ssm_dummy_value = None
            
            try:
                with default_storage.open(backup_minio_path, 'rb') as f:
                    zip_bytes = f.read()
                    
                    if device_brand == 'samsung':
                        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zip_ref:
                            file_list = zip_ref.namelist()
                            
                            for member in file_list:
                                lower_member = member.lower()
                                
                                if 'ssmdummyvalue' in lower_member and (lower_member.endswith('.exml') or lower_member.endswith('.xml')):
                                    logger.info(f"Found SSM Dummy file: {member}")
                                    try:
                                        dummy_content = zip_ref.read(member)
                                        ssm_dummy_value = self._get_ssm_key(dummy_content)
                                        if ssm_dummy_value:
                                            logger.info("Successfully retrieved SSM key from server")
                                            break
                                    except Exception as e:
                                        logger.error(f"Error extracting SSM key: {e}")
                        
                    logger.info(f"Processing backup with device brand: {device_brand}")

                    IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic', '.heif', '.tiff', '.tif', '.raw', '.cr2', '.nef', '.arw'}
                    VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm', '.m4v', '.3gp', '.3g2'}
                    AUDIO_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma', '.opus', '.amr'}
                    ALL_MEDIA_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS | AUDIO_EXTENSIONS

                    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zip_ref:
                        file_list = zip_ref.namelist()
                        total_files = len(file_list)
                        processed_count = 0
                        media_count = 0
                        
                        for member in file_list:
                            if member.endswith('/'):
                                continue
                                
                            file_name = os.path.basename(member)
                            if not file_name:
                                continue
                            
                            ext = os.path.splitext(file_name)[1].lower()
                                
                            try:
                                file_content = zip_ref.read(member)
                                
                                if ext in ALL_MEDIA_EXTENSIONS:
                                    try:
                                        if ext in IMAGE_EXTENSIONS:
                                            category = 'image'
                                        elif ext in VIDEO_EXTENSIONS:
                                            category = 'video'
                                        elif ext in AUDIO_EXTENSIONS:
                                            category = 'music'
                                        else:
                                            category = 'other'
                                        
                                        storage_path = f"Users Backups/{request.user.username}/{backup.name} {backup.id}/Files/{member}"
                                        from django.core.files.base import ContentFile
                                        saved_path = default_storage.save(storage_path, ContentFile(file_content))
                                        
                                        from .models import File as FileModel
                                        FileModel.objects.create(
                                            backup_id=backup.id,
                                            name=file_name,
                                            file=saved_path,
                                            size=len(file_content),
                                            category=category
                                        )
                                        
                                        media_count += 1
                                        if 'files' not in stats:
                                            stats['files'] = 0
                                        stats['files'] += 1
                                        
                                    except Exception as e:
                                        logger.error(f"Error saving media file {member}: {e}")
                                else:
                                    info = self._get_server_file_info(file_name, device_brand)
                                    
                                    result = self._process_on_server(
                                        file_name, 
                                        file_content, 
                                        info, 
                                        ssm_dummy_value
                                    )
                                    
                                    if result and result.get('success'):
                                        data_type = result.get('data_type')
                                        data = result.get('data', [])
                                        
                                        if data_type and data:
                                            count = save_extracted_data(backup.id, data_type, data)
                                            
                                            if data_type not in stats:
                                                stats[data_type] = 0
                                            stats[data_type] += count
                                        
                                processed_count += 1
                                if processed_count % 10 == 0:
                                    logger.info(f"Processed {processed_count}/{total_files} files ({media_count} media saved locally)")
                                    
                            except Exception as e:
                                logger.error(f"Error processing file {member}: {e}")
                                continue
                        
                        logger.info(f"Processing complete: {media_count} media files saved locally")

            except Exception as e:
                logger.error(f"Error during zip processing: {e}")
            
            return Response({
                'message': 'Backup processed successfully',
                'backup_id': backup.id,
                'stats': stats
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Upload failed: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _get_ssm_key(self, file_content):
        url = f"{settings.MAIN_SERVER_URL}/api/v1/dashboard/extract-key/"
        headers = {'X-API-KEY': settings.MAIN_SERVER_API_KEY}
        
        try:
            files = {'file': ('SSMDummyValue.exml', file_content)}
            response = requests.post(url, files=files, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return response.json().get('ssm_dummy_value')
            else:
                logger.error(f"Failed to get SSM key: {response.text}")
        except Exception as e:
            logger.error(f"Error getting SSM key: {e}")
        return None

    def _get_server_file_info(self, file_name, device_brand):
        url = f"{settings.MAIN_SERVER_URL}/api/v1/dashboard/opensource/file-info/"
        headers = {'X-API-KEY': settings.MAIN_SERVER_API_KEY}
        try:
            response = requests.post(url, json={
                'file_name': file_name,
                'device_brand': device_brand
            }, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return response.json().get('data', {})
        except Exception as e:
            logger.error(f"Error getting file info from server: {e}")
        return {}

    def _process_on_server(self, file_name, file_content, info, ssm_dummy_value):
        url = f"{settings.MAIN_SERVER_URL}/api/v1/dashboard/opensource/process-file/"
        headers = {'X-API-KEY': settings.MAIN_SERVER_API_KEY}
        
        files = {'file': (file_name, file_content)}
        data = {
            'file_name': file_name,
            'device_brand': info.get('device_brand', 'samsung'),
            'needs_decryption': str(info.get('needs_decryption', False)).lower(),
            'decryption_type': info.get('decryption_type', ''),
            'ssm_dummy_value': ssm_dummy_value or ''
        }
        
        try:
            response = requests.post(url, data=data, files=files, headers=headers, timeout=60)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Server returned {response.status_code} for {file_name}")
        except Exception as e:
            logger.error(f"Error processing file on server: {e}")
        return None

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        queryset = self.get_queryset()
        
        total_backups = queryset.count()
        total_size = queryset.aggregate(total=models.Sum('size'))['total'] or 0
        total_size_gb = round(total_size / (1024 ** 3), 2)
        
        status_counts = dict(queryset.values_list('status').annotate(count=models.Count('status')))
        
        latest_backup = queryset.order_by('-created_at').first()
        latest_backup_data = None
        if latest_backup:
            serializer = self.get_serializer(latest_backup)
            latest_backup_data = serializer.data
        
        stats = {
            'total_backups': total_backups,
            'total_size_bytes': total_size,
            'total_size_gb': total_size_gb,
            'status': {
                'processing': status_counts.get('processing', 0),
                'completed': status_counts.get('completed', 0),
                'failed': status_counts.get('failed', 0),
            },
            'latest_backup': latest_backup_data
        }
        
        return Response(stats)

    def _get_backup_name(self, backup_dir, default_name):
        default_name = os.path.splitext(default_name)[0]
        metadata_file = Path(backup_dir) / 'metadata.json'

        if metadata_file.exists():
            try:
                with open(metadata_file) as f:
                    metadata = json.load(f)
                    if metadata.get('backup_name'):
                        return metadata['backup_name']
            except Exception:
                pass

        return default_name
    
    def _get_device_model(self, backup_dir, filename):
        smart_switch_file = None
        for root, _, files in os.walk(backup_dir):
            if 'SmartSwitchBackup_back.json' in files:
                smart_switch_file = os.path.join(root, 'SmartSwitchBackup_back.json')
                break
        
        if smart_switch_file and os.path.exists(smart_switch_file):
            try:
                with open(smart_switch_file, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                    if metadata.get('DisplayName'):
                        return metadata['DisplayName']
                    if metadata.get('BrandName'):
                        return metadata['BrandName']
                    if metadata.get('ModelName'):
                        return metadata['ModelName']
            except Exception as e:
                logger.warning(f"Error reading device model from {smart_switch_file}: {e}")
                
        clean_filename = os.path.splitext(filename)[0]
        
        parts = clean_filename.split('_')
        if len(parts) > 0:
            first_part = parts[0]
            if first_part.startswith('SM-') or first_part.startswith('GT-') or '-' in first_part:
                return first_part
        
        folder_name = os.path.basename(backup_dir)
        if folder_name.startswith('backup_'):
            return ""
        
        parts = folder_name.split('_')
        if len(parts) > 0:
            first_part = parts[0]
            if first_part.startswith('SM-') or first_part.startswith('GT-') or '-' in first_part:
                return first_part
                
        return ""

class BackupProgressView(RetrieveAPIView):
    queryset = BackupLog.objects.all()
    serializer_class = BackupLogSerializer
    lookup_field = 'pk'
    permission_classes = [IsAuthenticated, IsBackupOwner]
    
    def retrieve(self, request, *args, **kwargs):
        log = self.get_object()
        serializer = self.get_serializer(log)
        data = serializer.data
        
        steps_info = []
        if log.steps_data:
            for step_num in range(1, log.total_steps + 1):
                step_key = f'step_{step_num}'
                if step_key in log.steps_data:
                    step_data = log.steps_data[step_key]
                    steps_info.append({
                        'step_number': step_num,
                        'name': step_data.get('name', ''),
                        'description': step_data.get('description', ''),
                        'progress_percent': step_data.get('progress_percent', 0),
                        'status': step_data.get('status', 'pending'),
                        'timestamp': step_data.get('timestamp', '')
                    })
        
        return Response(data)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()

        user = getattr(getattr(self, 'request', None), 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return Notification.objects.none()

        return Notification.objects.filter(user_id=user.pk)
        

    @action(detail=True, methods=['post'])
    def mark_as_seen(self, request, pk=None):
        notification = self.get_object()
        if notification.user != request.user:
            return Response({'detail': 'Forbidden'}, status=403)

        notification.is_seen = True
        notification.save()
        return Response({'detail': 'Marked as seen'})

    @action(detail=False, methods=['post'])
    def mark_all_as_seen(self, request):
        Notification.objects.filter(user=request.user, is_seen=False).update(is_seen=True)
        return Response({'detail': 'All notifications marked as seen'})
    
    @action(detail=False, methods=['get'], url_path='history')
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
        backup_ids = backups.values_list('id', flat=True)

        phone_models = (
            backups
            .values('model_name')
            .annotate(upload_count=Count('id'))
            .order_by('-upload_count')
        )
        phone_models_data = [
            {'device_name': entry['model_name'], 'upload_count': entry['upload_count']}
            for entry in phone_models
        ]

        top_calls = (
            CallLog.objects.filter(backup_id__in=backup_ids)
            .values('contact__name', 'backup__model_name')
            .annotate(call_count=Count('id'))
            .filter(contact__name__isnull=False)
            .order_by('-call_count')[:5]
        )
        frequently_called_contacts = [
            {
                'name': item['contact__name'],
                'phone_model': item['backup__model_name'],
                'call_count': item['call_count']
            }
            for item in top_calls
        ]

        messages_count = Message.objects.filter(backup_id__in=backup_ids).count()

        apps_count = ApkList.objects.filter(backup_id__in=backup_ids).count()

        contacts_count = Contact.objects.filter(backup_id__in=backup_ids).count()

        calls_count = CallLog.objects.filter(backup_id__in=backup_ids).count()

        files = File.objects.filter(backup_id__in=backup_ids)
        medias = {
            'videos_count': files.filter(category='video').count(),
            'images_count': files.filter(category='image').count(),
            'musics_count': files.filter(category='music').count(),
            'others': files.exclude(category__in=['video', 'image', 'music']).count()
        }

        days_back = 60
        recent_backups = backups.filter(created_at__gte=now() - timedelta(days=days_back))
        delta_days = (now().date() - recent_backups.order_by('created_at').first().created_at.date()).days if recent_backups.exists() else 0

        if delta_days <= 30:
            uploads_overview = (
                recent_backups
                .extra({'day': "DATE(created_at)"})
                .values('day')
                .annotate(count=Count('id'))
                .order_by('day')
            )
            overview = [{'date': str(entry['day']), 'count': entry['count']} for entry in uploads_overview]
        else:
            uploads_overview = (
                recent_backups
                .extra({'month': "strftime('%%Y-%%m', created_at)"})
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            )
            overview = [{'date': entry['month'], 'count': entry['count']} for entry in uploads_overview]

        return Response({
            'phone_models': phone_models_data,
            'frequently_called_contacts': frequently_called_contacts,
            'messages_count': messages_count,
            'apps_count': apps_count,
            'contacts_count': contacts_count,
            'calls_count': calls_count,
            'medias': medias,
            'uploads_overview': overview
        })

class BackupstatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        backups = Backup.objects.filter(user=user)
        total_count = backups.count()
        total_size = backups.aggregate(total=models.Sum('size'))['total'] or 0
        completed_count = backups.filter(status='completed').count()
        failed_count = backups.filter(status='failed').count()

        return Response({
            'total_backups': total_count,
            'total_size_bytes': total_size,
            'completed_backups': completed_count,
            'failed_backups': failed_count,
        })
        
class ClientInstanceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ClientInstanceSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'url']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        
        
        if getattr(self, 'swagger_fake_view', False):
            return ClientInstance.objects.none()

        user = getattr(self.request, 'user', None)

        if user and user.is_authenticated:
            return ClientInstance.objects.filter(user=user)
        
        
        return ClientInstance.objects.none()
        

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_api_key(self, request, pk=None):
        instance = self.get_object()
        instance.key = uuid.uuid4().hex + uuid.uuid4().hex
        instance.save()
        return Response({"key": instance.key}, status=200)

    @action(detail=True, methods=['delete'])
    def delete_api_key(self, request, pk=None):
        instance = self.get_object()
        if not instance.key:
            return Response({"message": "API Key not found."}, status=404)
        instance.key = None
        instance.save(update_fields=["key"])
        return Response({"message": "API key was successfully removed."}, status=204)
        
class PassthroughRenderer(BaseRenderer):
    media_type = 'application/octet-stream'
    format = None
    charset = None

    def render(self, data, media_type=None, renderer_context=None):
        return data

        
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

            download_url = generate_presigned_url(file_obj.file, expires_in=20)

            if not download_url:
                return Response(
                    {"error": "Could not generate download link."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            file_name = os.path.basename(file_obj.file.name)
            return Response(
                {'download_url': download_url, 'file_name': file_name},
                status=status.HTTP_200_OK
            )

        except File.DoesNotExist:
            return Response(
                {"error": "File not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class RegisterClientInstanceView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ClientRegistrationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        mac_address = validated_data.get('mac_address')

        ip_address = None
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0].strip()
        else:
            ip_address = request.META.get('HTTP_X_REAL_IP') or request.META.get('REMOTE_ADDR') or '0.0.0.0'

        if 'name' not in validated_data:
            validated_data['name'] = f"client_{mac_address}"

        validated_data['ip_address'] = ip_address
        client_instance, created = ClientInstance.objects.update_or_create(
            mac_address=mac_address,
            defaults=validated_data
        )

        client_instance.keyzoni = uuid.uuid4().hex + uuid.uuid4().hex
        client_instance.save(update_fields=['key'])

        if created:
            message = "Client newly registered and API key generated."
            status_code = status.HTTP_201_CREATED
        else:
            message = "Existing client found and API key has been updated."
            status_code = status.HTTP_200_OK
            
        return Response({
            "message": message,
            "api_key": client_instance.key
        }, status=status_code)
        
class TaskStatusView(APIView):
    permission_classes = [HasValidClientApiKey]

    def get(self, request, task_id, *args, **kwargs):
        task = get_object_or_404(AsyncTask, id=task_id)
        api_key = request.headers.get('X-API-KEY') or request.data.get('api_key')
        if str(task.client.key) != str(api_key):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        return Response({
            'task_id': task.id,
            'status': task.status,
            'result': task.result_data,
        }, status=status.HTTP_200_OK)