from config.pagination import DefaultPagination
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from dashboard.models import (Backup, IOSHomeScreenItem, IOSHomeScreenLayout, Wallpaper)
from dashboard.permissions import IsBackupOwner

from .filters import (IOSHomeScreenItemFilter, IOSHomeScreenLayoutFilter,
                      WallpaperFilter)
from .serializers import (IOSHomeScreenItemSerializer, IOSHomeScreenLayoutSerializer,
                          WallpaperSerializer)

backup_pk_param = openapi.Parameter(
    'backup_pk', 
    openapi.IN_PATH, 
    description="The ID of the backup to access.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class IOSHomeScreenLayoutViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = IOSHomeScreenLayoutSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filterset_class = IOSHomeScreenLayoutFilter
    
    def get_queryset(self):
        
        if getattr(self, 'swagger_fake_view', False):
            return IOSHomeScreenLayout.objects.none()
        
            
        backup_pk = self.kwargs.get('backup_pk')
        get_object_or_404(Backup, id=backup_pk, user=self.request.user) 
        
        return IOSHomeScreenLayout.objects.filter(backup_id=backup_pk).prefetch_related(
            'items__child_items', 'items__widgets_in_stack'
        )

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class IOSHomeScreenItemViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = IOSHomeScreenItemSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filterset_class = IOSHomeScreenItemFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'bundle_identifier']
    ordering_fields = ['page_index', 'position_on_page', 'title', 'item_type']
    ordering = ['page_index', 'position_on_page']
    pagination_class = DefaultPagination

    def get_queryset(self):
        
        if getattr(self, 'swagger_fake_view', False):
            return IOSHomeScreenItem.objects.none()
        
            
        backup_pk = self.kwargs.get('backup_pk')
        get_object_or_404(Backup, id=backup_pk, user=self.request.user) 

        return IOSHomeScreenItem.objects.filter(layout__backup_id=backup_pk)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class WallpaperViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WallpaperSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filterset_class = WallpaperFilter
    
    def get_queryset(self):
        
        if getattr(self, 'swagger_fake_view', False):
            return Wallpaper.objects.none()
        
            
        backup_pk = self.kwargs.get('backup_pk')
        get_object_or_404(Backup, id=backup_pk, user=self.request.user) 

        return Wallpaper.objects.filter(backup_id=backup_pk)