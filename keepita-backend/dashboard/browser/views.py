from collections import Counter
from urllib.parse import urlparse

from config.pagination import DefaultPagination
from django.db.models import Avg, Count, Q, Sum
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from dashboard.models import (Backup, BrowserBookmark, BrowserDownload,
                              BrowserHistory, BrowserSearch, BrowserTab)
from dashboard.permissions import IsBackupOwner

from .filters import (BrowserBookmarkFilter, BrowserDownloadFilter,
                      BrowserHistoryFilter, BrowserSearchFilter,
                      BrowserTabFilter)
from .serializers import (BrowserBookmarkSerializer, BrowserDetailSerializer,
                          BrowserDownloadSerializer, BrowserHistorySerializer,
                          BrowserSearchSerializer, BrowserTabSerializer)

backup_pk_param = openapi.Parameter(
    'backup_pk', 
    openapi.IN_PATH, 
    description="The ID of the backup to access.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class BrowserBookmarkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BrowserBookmark.objects.all()
    serializer_class = BrowserBookmarkSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BrowserBookmarkFilter
    search_fields = ['title', 'url']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']
    pagination_class = DefaultPagination

    def get_queryset(self):
        
        
        if getattr(self, 'swagger_fake_view', False):
            return BrowserBookmark.objects.none()
        
            
        backup_pk = self.kwargs.get('backup_pk')
        queryset = BrowserBookmark.objects.filter(
            backup__user=self.request.user
        ).select_related('backup')
        
        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)
            
        return queryset

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class BrowserHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BrowserHistory.objects.all()
    serializer_class = BrowserHistorySerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BrowserHistoryFilter
    search_fields = ['title', 'url']
    ordering_fields = ['last_visit_time', 'visit_count', 'title']
    ordering = ['-last_visit_time']
    pagination_class = DefaultPagination

    def get_queryset(self):
        
        
        if getattr(self, 'swagger_fake_view', False):
            return BrowserHistory.objects.none()
        

        backup_pk = self.kwargs.get('backup_pk')
        queryset = BrowserHistory.objects.filter(
            backup__user=self.request.user
        ).select_related('backup')
        
        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)
            
        return queryset

    @action(detail=False, methods=['get'])
    def top_domains(self, request, *args, **kwargs): 
        queryset = self.filter_queryset(self.get_queryset())
        
        domains = []
        for item in queryset:
            try:
                domain = urlparse(item.url).netloc
                if domain:
                    domains.append(domain)
            except:
                continue
        
        domain_counts = Counter(domains).most_common(10)
        
        return Response([
            {'domain': domain, 'count': count}
            for domain, count in domain_counts
        ])

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class BrowserDownloadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BrowserDownload.objects.all()
    serializer_class = BrowserDownloadSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BrowserDownloadFilter
    search_fields = ['file_name', 'url']
    ordering_fields = ['download_time', 'bytes_downloaded', 'file_name']
    ordering = ['-download_time']
    pagination_class = DefaultPagination

    def get_queryset(self):
        
        
        if getattr(self, 'swagger_fake_view', False):
            return BrowserDownload.objects.none()
        
            
        backup_pk = self.kwargs.get('backup_pk')
        queryset = BrowserDownload.objects.filter(
            backup__user=self.request.user
        ).select_related('backup')
        
        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)
            
        return queryset

    @action(detail=False, methods=['get'])
    def statistics(self, request, *args, **kwargs): 
        queryset = self.filter_queryset(self.get_queryset())
        
        total_downloads = queryset.count()
        total_size = queryset.aggregate(Sum('bytes_downloaded'))['bytes_downloaded__sum'] or 0
        
        state_stats = queryset.values('state').annotate(count=Count('id'))
        
        file_types = {}
        for download in queryset:
            if download.file_name:
                ext = download.file_name.split('.')[-1].lower()
                if ext:
                    file_types[ext] = file_types.get(ext, 0) + 1
        
        return Response({
            'total_downloads': total_downloads,
            'total_size_bytes': total_size,
            'total_size_mb': round(total_size / (1024 * 1024), 2) if total_size else 0,
            'state_distribution': list(state_stats),
            'file_type_distribution': [
                {'type': ext, 'count': count}
                for ext, count in sorted(file_types.items(), key=lambda x: x[1], reverse=True)[:10]
            ]
        })

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class BrowserSearchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BrowserSearch.objects.all()
    serializer_class = BrowserSearchSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BrowserSearchFilter
    search_fields = ['search_term', 'search_engine']
    ordering_fields = ['search_time', 'search_term']
    ordering = ['-search_time']
    pagination_class = DefaultPagination

    def get_queryset(self):
        
        
        if getattr(self, 'swagger_fake_view', False):
            return BrowserSearch.objects.none()
        
            
        backup_pk = self.kwargs.get('backup_pk')
        queryset = BrowserSearch.objects.filter(
            backup__user=self.request.user
        ).select_related('backup')
        
        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)
            
        return queryset

    @action(detail=False, methods=['get'])
    def popular_terms(self, request, *args, **kwargs): 
        queryset = self.filter_queryset(self.get_queryset())
        
        terms = [item.search_term.lower() for item in queryset if item.search_term]
        term_counts = Counter(terms).most_common(20)
        
        return Response([
            {'term': term, 'count': count}
            for term, count in term_counts
        ])

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class BrowserTabViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BrowserTab.objects.all()
    serializer_class = BrowserTabSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BrowserTabFilter
    search_fields = ['title', 'url']
    ordering_fields = ['last_accessed', 'title']
    ordering = ['-last_accessed']
    pagination_class = DefaultPagination

    def get_queryset(self):
        
        
        if getattr(self, 'swagger_fake_view', False):
            return BrowserTab.objects.none()
        
            
        backup_pk = self.kwargs.get('backup_pk')
        queryset = BrowserTab.objects.filter(
            backup__user=self.request.user
        ).select_related('backup')
        
        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)
            
        return queryset

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class BrowserOverviewViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request, backup_pk=None):
        
        
        if getattr(self, 'swagger_fake_view', False):
            return Response({}) 
        
            
        backup = get_object_or_404(Backup, pk=backup_pk, user=request.user)
        
        
        bookmarks_count = BrowserBookmark.objects.filter(backup=backup).count()
        history_count = BrowserHistory.objects.filter(backup=backup).count()
        downloads_count = BrowserDownload.objects.filter(backup=backup).count()
        searches_count = BrowserSearch.objects.filter(backup=backup).count()
        tabs_count = BrowserTab.objects.filter(backup=backup).count()
        
        
        recent_bookmarks = BrowserBookmark.objects.filter(backup=backup).order_by('-created_at')[:5]
        recent_history = BrowserHistory.objects.filter(backup=backup).order_by('-last_visit_time')[:5]
        recent_downloads = BrowserDownload.objects.filter(backup=backup).order_by('-download_time')[:5]
        
        
        history_items = BrowserHistory.objects.filter(backup=backup)
        domains = []
        for item in history_items:
            try:
                domain = urlparse(item.url).netloc
                if domain:
                    domains.append(domain)
            except:
                continue
        
        top_domains = [
            {'domain': domain, 'count': count}
            for domain, count in Counter(domains).most_common(5)
        ]
        
        
        download_stats = BrowserDownload.objects.filter(backup=backup).aggregate(
            total_size=Sum('bytes_downloaded'),
            avg_size=Avg('bytes_downloaded')
        )
        
        data = {
            'total_bookmarks': bookmarks_count,
            'total_history': history_count,
            'total_downloads': downloads_count,
            'total_searches': searches_count,
            'total_tabs': tabs_count,
            'recent_bookmarks': BrowserBookmarkSerializer(recent_bookmarks, many=True).data,
            'recent_history': BrowserHistorySerializer(recent_history, many=True).data,
            'recent_downloads': BrowserDownloadSerializer(recent_downloads, many=True).data,
            'top_domains': top_domains,
            'download_stats': {
                'total_size_bytes': download_stats['total_size'] or 0,
                'total_size_mb': round((download_stats['total_size'] or 0) / (1024 * 1024), 2),
                'average_size_mb': round((download_stats['avg_size'] or 0) / (1024 * 1024), 2),
            }
        }
        
        return Response(data)

    @action(detail=False, methods=['get'])
    def statistics(self, request, backup_pk=None):
        
        
        if getattr(self, 'swagger_fake_view', False):
            return Response({}) 
        

        backup_pk = self.kwargs.get('backup_pk')
        backup = get_object_or_404(Backup, pk=backup_pk, user=request.user)
        
        
        from datetime import datetime, timedelta

        from django.utils import timezone
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        daily_activity = {}
        for i in range(30):
            date = thirty_days_ago + timedelta(days=i)
            date_str = date.strftime('%Y-%m-%d')
            
            history_count = BrowserHistory.objects.filter(
                backup=backup,
                last_visit_time__date=date.date()
            ).count()
            
            bookmarks_count = BrowserBookmark.objects.filter(
                backup=backup,
                created_at__date=date.date()
            ).count()
            
            downloads_count = BrowserDownload.objects.filter(
                backup=backup,
                download_time__date=date.date()
            ).count()
            
            daily_activity[date_str] = {
                'history': history_count,
                'bookmarks': bookmarks_count,
                'downloads': downloads_count,
                'total': history_count + bookmarks_count + downloads_count
            }
        
        return Response({
            'daily_activity': daily_activity,
            'activity_summary': {
                'most_active_day': max(daily_activity.items(), key=lambda x: x[1]['total'])[0] if daily_activity else None,
                'total_activity': sum(day['total'] for day in daily_activity.values()),
                'average_daily_activity': round(sum(day['total'] for day in daily_activity.values()) / 30, 2)
            }
        })