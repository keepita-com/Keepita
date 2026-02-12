import django_filters
from django.db.models import Q

from dashboard.models import ApkList, ApkPermission

class ApkListFilter(django_filters.FilterSet):
    
    backup = django_filters.NumberFilter(field_name='backup__id')
    apk_name = django_filters.CharFilter(field_name='apk_name', lookup_expr='icontains')
    version_name = django_filters.CharFilter(field_name='version_name', lookup_expr='icontains')
    recent_used = django_filters.BooleanFilter(field_name='recent_used')
    
    min_size = django_filters.NumberFilter(field_name='size', lookup_expr='gte')
    max_size = django_filters.NumberFilter(field_name='size', lookup_expr='lte')
    size_mb_min = django_filters.NumberFilter(method='filter_size_mb_min')
    size_mb_max = django_filters.NumberFilter(method='filter_size_mb_max')
    
    last_used_after = django_filters.DateTimeFilter(field_name='last_time_used', lookup_expr='gte')
    last_used_before = django_filters.DateTimeFilter(field_name='last_time_used', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    size_category = django_filters.ChoiceFilter(
        method='filter_size_category',
        choices=[
            ('small', 'Small (< 10 MB)'),
            ('medium', 'Medium (10-100 MB)'),
            ('large', 'Large (> 100 MB)'),
        ]
    )
    
    has_permissions = django_filters.BooleanFilter(method='filter_has_permissions')
    permission_name = django_filters.CharFilter(method='filter_permission_name')
    
    class Meta:
        model = ApkList
        fields = [
            'backup', 'apk_name', 'version_name', 'recent_used',
            'min_size', 'max_size', 'size_mb_min', 'size_mb_max',
            'last_used_after', 'last_used_before', 'created_after', 'created_before',
            'size_category', 'has_permissions', 'permission_name'
        ]
    
    def filter_size_mb_min(self, queryset, name, value):
        if value is not None:
            return queryset.filter(size__gte=value * 1024 * 1024)
        return queryset
    
    def filter_size_mb_max(self, queryset, name, value):
        if value is not None:
            return queryset.filter(size__lte=value * 1024 * 1024)
        return queryset
    
    def filter_size_category(self, queryset, name, value):
        if value == 'small':
            return queryset.filter(size__lt=10 * 1024 * 1024)
        elif value == 'medium':
            return queryset.filter(size__gte=10 * 1024 * 1024, size__lt=100 * 1024 * 1024)
        elif value == 'large':
            return queryset.filter(size__gte=100 * 1024 * 1024)
        return queryset
    
    def filter_has_permissions(self, queryset, name, value):
        if value:
            return queryset.filter(permissions__isnull=False).distinct()
        else:
            return queryset.filter(permissions__isnull=True)
    
    def filter_permission_name(self, queryset, name, value):
        if value:
            return queryset.filter(permissions__permission_name__icontains=value).distinct()
        return queryset

class ApkPermissionFilter(django_filters.FilterSet):
    
    backup = django_filters.NumberFilter(field_name='backup__id')
    apk = django_filters.NumberFilter(field_name='apk__id')
    apk_name = django_filters.CharFilter(field_name='apk__apk_name', lookup_expr='icontains')
    permission_name = django_filters.CharFilter(field_name='permission_name', lookup_expr='icontains')
    permission_group = django_filters.CharFilter(field_name='permission_group', lookup_expr='icontains')
    status = django_filters.NumberFilter(field_name='status')
    flags = django_filters.NumberFilter(field_name='flags')
    protection_level = django_filters.NumberFilter(field_name='protection_level')
    
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = ApkPermission
        fields = [
            'backup', 'apk', 'apk_name', 'permission_name', 'permission_group',
            'status', 'flags', 'protection_level', 'created_after', 'created_before'
        ]