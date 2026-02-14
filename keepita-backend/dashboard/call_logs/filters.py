import django_filters
from django.db.models import Q

from dashboard.models import CallLog

class CallLogFilter(django_filters.FilterSet):
    
    backup = django_filters.NumberFilter(field_name='backup__id')
    call_type = django_filters.CharFilter(field_name='type', lookup_expr='iexact')
    number = django_filters.CharFilter(field_name='number', lookup_expr='icontains')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    
    date_from = django_filters.DateTimeFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateTimeFilter(field_name='date', lookup_expr='lte')
    date_range = django_filters.DateFromToRangeFilter(field_name='date')
    
    duration_min = django_filters.NumberFilter(field_name='duration', lookup_expr='gte')
    duration_max = django_filters.NumberFilter(field_name='duration', lookup_expr='lte')
    duration_range = django_filters.RangeFilter(field_name='duration')
    
    has_contact = django_filters.BooleanFilter(method='filter_has_contact')
    
    missed_calls = django_filters.BooleanFilter(method='filter_missed_calls')
    incoming_calls = django_filters.BooleanFilter(method='filter_incoming_calls')
    outgoing_calls = django_filters.BooleanFilter(method='filter_outgoing_calls')
    rejected_calls = django_filters.BooleanFilter(method='filter_rejected_calls')
    long_calls = django_filters.BooleanFilter(method='filter_long_calls')
    short_calls = django_filters.BooleanFilter(method='filter_short_calls')

    
    class Meta:
        model = CallLog
        fields = [
            'backup', 'call_type', 'number', 'name',
            'date_from', 'date_to', 'date_range',
            'duration_min', 'duration_max', 'duration_range',
            'has_contact', 'missed_calls', 'incoming_calls',
            'outgoing_calls', 'rejected_calls', 'long_calls', 'short_calls'
        ]
    
    def filter_has_contact(self, queryset, name, value):
        if value:
            return queryset.exclude(contact__isnull=True)
        return queryset.filter(contact__isnull=True)
    
    def filter_missed_calls(self, queryset, name, value):
        if value:
            return queryset.filter(type='MISSED')
        return queryset
    
    def filter_incoming_calls(self, queryset, name, value):
        if value:
            return queryset.filter(type='INCOMING')
        return queryset
    
    def filter_outgoing_calls(self, queryset, name, value):
        if value:
            return queryset.filter(type='OUTGOING')
        return queryset
    
    def filter_rejected_calls(self, queryset, name, value):
        if value:
            return queryset.filter(type='REJECTED')
        return queryset
    
    def filter_long_calls(self, queryset, name, value):
        if value:
            return queryset.filter(duration__gt=300)
        return queryset
    
    def filter_short_calls(self, queryset, name, value):
        if value:
            return queryset.filter(duration__lt=30)
        return queryset
    
    def filter_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(number__icontains=value) |
                Q(name__icontains=value) |
                Q(contact__name__icontains=value) |
                Q(contact__phone_number__icontains=value)
            )
        return queryset
