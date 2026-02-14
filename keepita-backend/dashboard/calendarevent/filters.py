from django_filters import rest_framework as filters

from ..models import CalendarEvent

class CalendarEventFilter(filters.FilterSet):
    summary = filters.CharFilter(field_name='summary', lookup_expr='icontains')
    
    location = filters.CharFilter(field_name='location', lookup_expr='icontains')
    
    start_date_after = filters.DateTimeFilter(field_name='start_date', lookup_expr='gte')
    
    start_date_before = filters.DateTimeFilter(field_name='start_date', lookup_expr='lte')
    
    end_date_after = filters.DateTimeFilter(field_name='end_date', lookup_expr='gte')
    
    end_date_before = filters.DateTimeFilter(field_name='end_date', lookup_expr='lte')

    class Meta:
        model = CalendarEvent
        fields = [
            'summary', 
            'location', 
            'start_date_after', 
            'start_date_before', 
            'end_date_after', 
            'end_date_before'
        ]