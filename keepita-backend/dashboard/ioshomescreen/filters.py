
import django_filters
from django_filters.rest_framework import FilterSet
from dashboard.models import IOSHomeScreenLayout, IOSHomeScreenItem, Wallpaper

class IOSHomeScreenLayoutFilter(FilterSet):
    backup = django_filters.NumberFilter(field_name='backup__id')
    
    class Meta:
        model = IOSHomeScreenLayout
        fields = ['backup', 'widget_version']

class IOSHomeScreenItemFilter(FilterSet):
    backup = django_filters.NumberFilter(field_name='layout__backup__id')
    layout = django_filters.NumberFilter(field_name='layout__id')
    parent_folder = django_filters.NumberFilter(field_name='parent_folder__id')
    
    item_type = django_filters.ChoiceFilter(choices=IOSHomeScreenItem.ItemType.choices)
    location = django_filters.ChoiceFilter(choices=IOSHomeScreenItem.Location.choices)
    page_index = django_filters.NumberFilter()
    title = django_filters.CharFilter(lookup_expr='icontains')
    bundle_identifier = django_filters.CharFilter(lookup_expr='icontains')
    
    is_in_folder = django_filters.BooleanFilter(field_name='parent_folder', lookup_expr='isnull', exclude=True)
    
    class Meta:
        model = IOSHomeScreenItem
        fields = [
            'backup', 'layout', 'parent_folder', 'item_type', 'location', 
            'page_index', 'title', 'bundle_identifier', 'is_in_folder'
        ]

class WallpaperFilter(FilterSet):
    backup = django_filters.NumberFilter(field_name='backup__id')
    type = django_filters.ChoiceFilter(choices=Wallpaper.TYPE_CHOICES)
    original_path = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Wallpaper
        fields = ['backup', 'type', 'original_path']