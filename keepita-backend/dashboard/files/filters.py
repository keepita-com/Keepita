from django_filters import rest_framework as filters
from ..models import File

class FileFilter(filters.FilterSet):
    file_name = filters.CharFilter(lookup_expr='icontains')
    file_extension = filters.CharFilter(lookup_expr='iexact')
    category = filters.CharFilter(lookup_expr='iexact')
    
    min_size = filters.NumberFilter(field_name='file_size', lookup_expr='gte')
    max_size = filters.NumberFilter(field_name='file_size', lookup_expr='lte')
    
    created_after = filters.DateTimeFilter(field_name='created_date', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_date', lookup_expr='lte')

    class Meta:
        model = File
        fields = ['file_name', 'file_extension', 'category',
                 'min_size', 'max_size', 'created_after', 'created_before']