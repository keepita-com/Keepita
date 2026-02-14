import django_filters
from django.db.models import Q

from dashboard.models import BluetoothDevice

class BluetoothDeviceFilter(django_filters.FilterSet):
    
    backup = django_filters.NumberFilter(field_name='backup__id')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    address = django_filters.CharFilter(field_name='address', lookup_expr='icontains')
    device_class = django_filters.NumberFilter(field_name='device_class')
    appearance = django_filters.NumberFilter(field_name='appearance')
    bond_state = django_filters.NumberFilter(field_name='bond_state')
    link_type = django_filters.NumberFilter(field_name='link_type')
    
    last_connected_after = django_filters.DateTimeFilter(field_name='last_connected', lookup_expr='gte')
    last_connected_before = django_filters.DateTimeFilter(field_name='last_connected', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    def filter_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(name__icontains=value) |
                Q(address__icontains=value)
            )
        return queryset
    
    class Meta:
        model = BluetoothDevice
        fields = [
            'backup', 'name', 'address', 'device_class', 'appearance',
            'bond_state', 'link_type', 'last_connected_after', 
            'last_connected_before', 'created_after', 'created_before'
        ]
