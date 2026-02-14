import django_filters
from django.db.models import Q
from dashboard.models import WifiNetwork

class WifiNetworkFilter(django_filters.FilterSet):
    
    security_type = django_filters.ChoiceFilter(
        field_name='security_type',
        choices=WifiNetwork.SECURITY_TYPES,
        label='Security Type'
    )
    
    hidden = django_filters.BooleanFilter(field_name='hidden', label='Hidden Network')
    is_saved = django_filters.BooleanFilter(field_name='is_saved', label='Saved Network')
    has_password = django_filters.BooleanFilter(method='filter_has_password', label='Has Password')
    
    frequency_band = django_filters.ChoiceFilter(
        method='filter_frequency_band',
        choices=[
            ('2.4', '2.4 GHz'),
            ('5', '5 GHz'),
            ('unknown', 'Unknown'),
        ],
        label='Frequency Band'
    )
    
    last_connected_from = django_filters.DateTimeFilter(
        field_name='last_connected', 
        lookup_expr='gte', 
        label='Last Connected From'
    )
    last_connected_to = django_filters.DateTimeFilter(
        field_name='last_connected', 
        lookup_expr='lte', 
        label='Last Connected To'
    )
    
    created_from = django_filters.DateTimeFilter(
        field_name='created_at', 
        lookup_expr='gte', 
        label='Created From'
    )
    created_to = django_filters.DateTimeFilter(
        field_name='created_at', 
        lookup_expr='lte', 
        label='Created To'
    )
    
    backup_name = django_filters.CharFilter(
        field_name='backup__name', 
        lookup_expr='icontains', 
        label='Backup Name'
    )
    
    class Meta:
        model = WifiNetwork
        fields = [
            'security_type', 'hidden', 'is_saved', 'frequency_band',
            'last_connected_from', 'last_connected_to', 'created_from', 
            'created_to', 'backup_name'
        ]
    
    def filter_has_password(self, queryset, name, value):
        if value is True:
            return queryset.exclude(Q(password__isnull=True) | Q(password=''))
        elif value is False:
            return queryset.filter(Q(password__isnull=True) | Q(password=''))
        return queryset
    
    def filter_frequency_band(self, queryset, name, value):
        if value == '2.4':
            return queryset.filter(frequency__range=['2400', '2500'])
        elif value == '5':
            return queryset.filter(frequency__range=['5000', '6000'])
        elif value == 'unknown':
            return queryset.filter(Q(frequency__isnull=True) | Q(frequency=''))
        return queryset
