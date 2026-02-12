import django_filters
from django.db.models import Q

from dashboard.models import (HomeScreenFolder, HomeScreenItem,
                              HomeScreenLayout, Wallpaper)

class HomeScreenLayoutFilter(django_filters.FilterSet):
    backup = django_filters.NumberFilter(field_name='backup__id')
    min_rows = django_filters.NumberFilter(field_name='rows', lookup_expr='gte')
    max_rows = django_filters.NumberFilter(field_name='rows', lookup_expr='lte')
    min_columns = django_filters.NumberFilter(field_name='columns', lookup_expr='gte')
    max_columns = django_filters.NumberFilter(field_name='columns', lookup_expr='lte')
    min_pages = django_filters.NumberFilter(field_name='page_count', lookup_expr='gte')
    max_pages = django_filters.NumberFilter(field_name='page_count', lookup_expr='lte')
    has_zero_page = django_filters.BooleanFilter(field_name='has_zero_page')
    is_portrait_only = django_filters.BooleanFilter(field_name='is_portrait_only')
    layout_locked = django_filters.BooleanFilter(field_name='layout_locked')
    badge_enabled = django_filters.BooleanFilter(field_name='badge_enabled')
    notification_panel_enabled = django_filters.BooleanFilter(field_name='notification_panel_enabled')
    quick_access_enabled = django_filters.BooleanFilter(field_name='quick_access_enabled')
    
    class Meta:
        model = HomeScreenLayout
        fields = [
            'backup', 'min_rows', 'max_rows', 'min_columns', 'max_columns',
            'min_pages', 'max_pages', 'has_zero_page', 'is_portrait_only',
            'layout_locked', 'badge_enabled', 'notification_panel_enabled',
            'quick_access_enabled'
        ]

class HomeScreenFolderFilter(django_filters.FilterSet):
    backup = django_filters.NumberFilter(field_name='layout__backup__id')
    layout = django_filters.NumberFilter(field_name='layout__id')
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    screen_index = django_filters.NumberFilter(field_name='screen_index')
    min_screen_index = django_filters.NumberFilter(field_name='screen_index', lookup_expr='gte')
    max_screen_index = django_filters.NumberFilter(field_name='screen_index', lookup_expr='lte')
    x_position = django_filters.NumberFilter(field_name='x')
    y_position = django_filters.NumberFilter(field_name='y')
    color = django_filters.NumberFilter(field_name='color')
    
    class Meta:
        model = HomeScreenFolder
        fields = [
            'backup', 'layout', 'title', 'screen_index', 'min_screen_index',
            'max_screen_index', 'x_position', 'y_position', 'color'
        ]

class HomeScreenItemFilter(django_filters.FilterSet):
    backup = django_filters.NumberFilter(field_name='backup__id')
    layout = django_filters.NumberFilter(field_name='layout__id')
    folder = django_filters.NumberFilter(field_name='folder__id')
    item_type = django_filters.ChoiceFilter(choices=HomeScreenItem.ITEM_TYPES)
    location = django_filters.ChoiceFilter(choices=HomeScreenItem.LOCATIONS)
    screen_index = django_filters.NumberFilter(field_name='screen_index')
    min_screen_index = django_filters.NumberFilter(field_name='screen_index', lookup_expr='gte')
    max_screen_index = django_filters.NumberFilter(field_name='screen_index', lookup_expr='lte')
    x_position = django_filters.NumberFilter(field_name='x')
    y_position = django_filters.NumberFilter(field_name='y')
    package_name = django_filters.CharFilter(field_name='package_name', lookup_expr='icontains')
    class_name = django_filters.CharFilter(field_name='class_name', lookup_expr='icontains')
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    is_hidden = django_filters.BooleanFilter(field_name='is_hidden')
    has_folder = django_filters.BooleanFilter(method='filter_has_folder')
    
    def filter_has_folder(self, queryset, name, value):
        if value:
            return queryset.filter(folder__isnull=False)
        return queryset.filter(folder__isnull=True)
    
    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) |
            Q(package_name__icontains=value) |
            Q(class_name__icontains=value)
        )
    
    class Meta:
        model = HomeScreenItem
        fields = [
            'backup', 'layout', 'folder', 'item_type', 'location',
            'screen_index', 'min_screen_index', 'max_screen_index',
            'x_position', 'y_position', 'package_name', 'class_name',
            'title', 'is_hidden', 'has_folder'
        ]

class WallpaperFilter(django_filters.FilterSet):
    backup = django_filters.NumberFilter(field_name='backup__id')
    type = django_filters.ChoiceFilter(choices=Wallpaper.TYPE_CHOICES)
    is_default = django_filters.BooleanFilter(field_name='is_default')
    original_path = django_filters.CharFilter(field_name='original_path', lookup_expr='icontains')
    has_image = django_filters.BooleanFilter(method='filter_has_image')
    
    def filter_has_image(self, queryset, name, value):
        if value:
            return queryset.exclude(image='')
        return queryset.filter(image='')
    
    class Meta:
        model = Wallpaper
        fields = ['backup', 'type', 'is_default', 'original_path', 'has_image']
