from datetime import timedelta

import django_filters
from django.db.models import Q
from django.utils import timezone

from dashboard.models import (BrowserBookmark, BrowserDownload, BrowserHistory,
                              BrowserSearch, BrowserTab)

class BrowserBookmarkFilter(django_filters.FilterSet):
    
    created_from = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte', label='Created From')
    created_to = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte', label='Created To')
    
    class Meta:
        model = BrowserBookmark
        fields = ['created_from', 'created_to']

class BrowserHistoryFilter(django_filters.FilterSet):
    
    hidden = django_filters.BooleanFilter(field_name='hidden', label='Hidden')
    source = django_filters.CharFilter(field_name='source', lookup_expr='icontains', label='Source')
    
    visit_from = django_filters.DateTimeFilter(field_name='last_visit_time', lookup_expr='gte', label='Visit From')
    visit_to = django_filters.DateTimeFilter(field_name='last_visit_time', lookup_expr='lte', label='Visit To')
    
    time_period = django_filters.ChoiceFilter(
        method='filter_time_period',
        choices=[
            ('today', 'Today'),
            ('week', 'This Week'),
            ('month', 'This Month'),
            ('year', 'This Year'),
        ],
        label='Time Period'
    )
    
    min_visits = django_filters.NumberFilter(field_name='visit_count', lookup_expr='gte', label='Min Visits')
    max_visits = django_filters.NumberFilter(field_name='visit_count', lookup_expr='lte', label='Max Visits')
    
    class Meta:
        model = BrowserHistory
        fields = ['hidden', 'source', 'visit_from', 'visit_to', 'min_visits', 'max_visits']

    
    def filter_time_period(self, queryset, name, value):
        if not value:
            return queryset
        
        now = timezone.now()
        
        if value == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif value == 'week':
            start_date = now - timedelta(days=7)
        elif value == 'month':
            start_date = now - timedelta(days=30)
        elif value == 'year':
            start_date = now - timedelta(days=365)
        else:
            return queryset
        
        return queryset.filter(last_visit_time__gte=start_date)

class BrowserDownloadFilter(django_filters.FilterSet):
    
    state = django_filters.ChoiceFilter(
        choices=BrowserDownload.STATES,
        field_name='state',
        label='Download State'
    )
    
    download_from = django_filters.DateTimeFilter(field_name='download_time', lookup_expr='gte', label='Download From')
    download_to = django_filters.DateTimeFilter(field_name='download_time', lookup_expr='lte', label='Download To')
    
    min_size_mb = django_filters.NumberFilter(method='filter_min_size', label='Min Size (MB)')
    max_size_mb = django_filters.NumberFilter(method='filter_max_size', label='Max Size (MB)')
    
    class Meta:
        model = BrowserDownload
        fields = ['state', 'download_from', 'download_to']
    
    def filter_min_size(self, queryset, name, value):
        if not value:
            return queryset
        
        min_bytes = value * 1024 * 1024
        return queryset.filter(bytes_downloaded__gte=min_bytes)
    
    def filter_max_size(self, queryset, name, value):
        if not value:
            return queryset
        
        max_bytes = value * 1024 * 1024
        return queryset.filter(bytes_downloaded__lte=max_bytes)

class BrowserSearchFilter(django_filters.FilterSet):
    
    search_engine = django_filters.CharFilter(field_name='search_engine', lookup_expr='icontains', label='Search Engine')
    
    search_from = django_filters.DateTimeFilter(field_name='search_time', lookup_expr='gte', label='Search From')
    search_to = django_filters.DateTimeFilter(field_name='search_time', lookup_expr='lte', label='Search To')
    
    class Meta:
        model = BrowserSearch
        fields = ['search_engine', 'search_from', 'search_to']

class BrowserTabFilter(django_filters.FilterSet):
    
    is_incognito = django_filters.BooleanFilter(field_name='is_incognito', label='Incognito')
    is_pinned = django_filters.BooleanFilter(field_name='is_pinned', label='Pinned')
    
    accessed_from = django_filters.DateTimeFilter(field_name='last_accessed', lookup_expr='gte', label='Accessed From')
    accessed_to = django_filters.DateTimeFilter(field_name='last_accessed', lookup_expr='lte', label='Accessed To')
    
    class Meta:
        model = BrowserTab
        fields = ['is_incognito', 'is_pinned', 'accessed_from', 'accessed_to']
