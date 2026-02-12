from config.pagination import DefaultPagination
from django.core.paginator import Paginator
from django.db.models import Count, Max, Q, Sum
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from dashboard.models import ApkList, ApkPermission, Backup
from dashboard.permissions import IsBackupOwner

from .filters import ApkListFilter, ApkPermissionFilter
from .serializers import (ApkListDetailSerializer, ApkListSerializer,
                          ApkOverviewSerializer, ApkPermissionSerializer)

backup_pk_param = openapi.Parameter(
    'backup_pk', 
    openapi.IN_PATH, 
    description="The ID of the backup to access.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class ApkListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ApkList.objects.all()
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filterset_class = ApkListFilter
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter
    ]
    search_fields = ['apk_name', 'version_name']
    ordering_fields = ['apk_name', 'size', 'last_time_used', 'created_at']
    ordering = ['apk_name']
    pagination_class = DefaultPagination
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ApkListDetailSerializer
        return ApkListSerializer
    
    def get_queryset(self):
        
        if getattr(self, 'swagger_fake_view', False):
            return ApkList.objects.none()
        

        queryset = ApkList.objects.select_related('backup').prefetch_related('permissions')
        backup_id = self.kwargs.get('backup_pk')
        
        if backup_id:
            
            backup = get_object_or_404(Backup, id=backup_id, user=self.request.user)
            queryset = queryset.filter(backup=backup)
        else:
            
            queryset = queryset.filter(backup__user=self.request.user)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def recently_used(self, request, *args, **kwargs): 
        backup_pk = self.kwargs.get('backup_pk')
        queryset = self.get_queryset().filter(recent_used=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def largest_apps(self, request, *args, **kwargs): 
        backup_pk = self.kwargs.get('backup_pk')
        queryset = self.get_queryset().filter(size__isnull=False).order_by('-size')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overview(self, request, *args, **kwargs): 
        backup_pk = self.kwargs.get('backup_pk')
        queryset = self.get_queryset()
        
        
        total_apps = queryset.count()
        recently_used_apps = queryset.filter(recent_used=True).count()
        
        
        total_size_bytes = queryset.aggregate(total=Sum('size'))['total'] or 0
        total_size_mb = round(total_size_bytes / (1024 * 1024), 2)
        
        
        total_permissions = ApkPermission.objects.filter(
            apk__in=queryset
        ).count()
        
        
        most_recent_app = queryset.filter(
            last_time_used__isnull=False
        ).order_by('-last_time_used').first()
        
        
        largest_app = queryset.filter(
            size__isnull=False
        ).order_by('-size').first()
        
        
        apps_by_size_range = {
            'small': queryset.filter(size__lt=10 * 1024 * 1024).count(),
            'medium': queryset.filter(
                size__gte=10 * 1024 * 1024, 
                size__lt=100 * 1024 * 1024
            ).count(),
            'large': queryset.filter(size__gte=100 * 1024 * 1024).count(),
        }
        
        data = {
            'total_apps': total_apps,
            'recently_used_apps': recently_used_apps,
            'total_size_mb': total_size_mb,
            'total_permissions': total_permissions,
            'most_recent_app': ApkListSerializer(most_recent_app, context={'request': request}).data if most_recent_app else None,
            'largest_app': ApkListSerializer(largest_app, context={'request': request}).data if largest_app else None,
            'apps_by_size_range': apps_by_size_range,
        }
        
        serializer = ApkOverviewSerializer(data)
        return Response(serializer.data)

app_id_param = openapi.Parameter(
    'app_id', 
    openapi.IN_PATH, 
    description="The ID of the app.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param, app_id_param])  
class AppPermissionsView(APIView):
    permission_classes = [IsAuthenticated, IsBackupOwner]
    
    def get(self, request, backup_pk, app_id):
        
        if getattr(self, 'swagger_fake_view', False):
            return Response(data=[]) 
        

        
        backup = get_object_or_404(Backup, id=backup_pk, user=request.user)
        
        
        app = get_object_or_404(ApkList, id=app_id, backup=backup)
        
        
        permissions = ApkPermission.objects.filter(apk=app).select_related('apk', 'backup')
        
        
        search = request.GET.get('search', '')
        if search:
            permissions = permissions.filter(
                Q(permission_name__icontains=search) |
                Q(permission_group__icontains=search)
            )
        
        
        permission_name = request.GET.get('permission_name', '')
        if permission_name:
            permissions = permissions.filter(permission_name__icontains=permission_name)
        
        permission_group = request.GET.get('permission_group', '')
        if permission_group:
            permissions = permissions.filter(permission_group__icontains=permission_group)
        
        status_filter = request.GET.get('status', '')
        if status_filter:
            try:
                status_value = int(status_filter)
                permissions = permissions.filter(status=status_value)
            except ValueError:
                pass
        
        protection_level = request.GET.get('protection_level', '')
        if protection_level:
            try:
                protection_value = int(protection_level)
                permissions = permissions.filter(protection_level=protection_value)
            except ValueError:
                pass
        
        
        ordering = request.GET.get('ordering', 'permission_name')
        valid_orderings = ['permission_name', '-permission_name', 'permission_group', '-permission_group', 
                          'status', '-status', 'protection_level', '-protection_level', 'created_at', '-created_at']
        if ordering in valid_orderings:
            permissions = permissions.order_by(ordering)
        else:
            permissions = permissions.order_by('permission_name')
        
        
        page_size = int(request.GET.get('page_size', 20))
        page_number = int(request.GET.get('page', 1))
        
        paginator = Paginator(permissions, page_size)
        page_obj = paginator.get_page(page_number)
        
        
        permissions_serializer = ApkPermissionSerializer(page_obj, many=True, context={'request': request})
        
        
        app_serializer = ApkListSerializer(app, context={'request': request})
        
        
        response_data = {
            'app': app_serializer.data,
            'permissions': {
                'count': paginator.count,
                'next': None,
                'previous': None,
                'results': permissions_serializer.data
            },
            'stats': {
                'total_permissions': permissions.count(),
                'unique_groups': permissions.values('permission_group').distinct().count(),
                'protection_levels': list(permissions.values_list('protection_level', flat=True).distinct())
            }
        }
        
        
        if page_obj.has_next():
            response_data['permissions']['next'] = f"?page={page_obj.next_page_number()}"
        if page_obj.has_previous():
            response_data['permissions']['previous'] = f"?page={page_obj.previous_page_number()}"
        
        return Response(response_data)