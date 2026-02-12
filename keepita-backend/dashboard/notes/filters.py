import django_filters
from dashboard.models import Note

class NoteFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    body = django_filters.CharFilter(field_name='body', lookup_expr='icontains')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Note
        fields = ['title', 'body', 'created_after', 'created_before']