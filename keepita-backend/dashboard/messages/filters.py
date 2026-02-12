import django_filters
from django.db.models import Count, Max, Q

from dashboard.models import ChatThread, Message

class ChatThreadFilter(django_filters.FilterSet):
    
    backup = django_filters.NumberFilter(field_name='backup__id')
    contact = django_filters.NumberFilter(field_name='contact__id')
    address = django_filters.CharFilter(field_name='address', lookup_expr='icontains')
    
    contact_name = django_filters.CharFilter(field_name='contact__name', lookup_expr='icontains')
    contact_phone = django_filters.CharFilter(field_name='contact__phone_number', lookup_expr='icontains')
    is_favorite_contact = django_filters.BooleanFilter(field_name='contact__is_favorite')
    
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    has_messages = django_filters.BooleanFilter(method='filter_has_messages')
    min_messages = django_filters.NumberFilter(method='filter_min_messages')
    max_messages = django_filters.NumberFilter(method='filter_max_messages')
    has_unread = django_filters.BooleanFilter(method='filter_has_unread')
    
    last_message_after = django_filters.DateTimeFilter(method='filter_last_message_after')
    last_message_before = django_filters.DateTimeFilter(method='filter_last_message_before')
    
    class Meta:
        model = ChatThread
        fields = [
            'backup', 'contact', 'address', 'contact_name', 'contact_phone',
            'is_favorite_contact', 'created_after', 'created_before',
            'has_messages', 'min_messages', 'max_messages', 'has_unread',
            'last_message_after', 'last_message_before'
        ]
    
    def filter_has_messages(self, queryset, name, value):
        if value:
            return queryset.filter(messages__isnull=False).distinct()
        else:
            return queryset.filter(messages__isnull=True)
    
    def filter_min_messages(self, queryset, name, value):
        return queryset.annotate(
            messages_count=Count('messages')
        ).filter(messages_count__gte=value)
    
    def filter_max_messages(self, queryset, name, value):
        return queryset.annotate(
            messages_count=Count('messages')
        ).filter(messages_count__lte=value)
    
    def filter_has_unread(self, queryset, name, value):
        if value:
            return queryset.filter(messages__seen=False).distinct()
        else:
            return queryset.exclude(messages__seen=False).distinct()
    
    def filter_last_message_after(self, queryset, name, value):
        return queryset.annotate(
            last_message_date=Max('messages__date')
        ).filter(last_message_date__gte=value)
    
    def filter_last_message_before(self, queryset, name, value):
        return queryset.annotate(
            last_message_date=Max('messages__date')
        ).filter(last_message_date__lte=value)

class MessageFilter(django_filters.FilterSet):
    
    backup = django_filters.NumberFilter(field_name='backup__id')
    chat_thread = django_filters.NumberFilter(field_name='chat_thread__id')
    
    body = django_filters.CharFilter(field_name='body', lookup_expr='icontains')
    body_exact = django_filters.CharFilter(field_name='body', lookup_expr='exact')
    body_empty = django_filters.BooleanFilter(method='filter_body_empty')
    
    status = django_filters.NumberFilter(field_name='status')
    seen = django_filters.BooleanFilter(field_name='seen')
    sim_slot = django_filters.NumberFilter(field_name='sim_slot')
    
    date_after = django_filters.DateTimeFilter(field_name='date', lookup_expr='gte')
    date_before = django_filters.DateTimeFilter(field_name='date', lookup_expr='lte')
    date_range = django_filters.DateFromToRangeFilter(field_name='date')
    
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    updated_after = django_filters.DateTimeFilter(field_name='updated_at', lookup_expr='gte')
    updated_before = django_filters.DateTimeFilter(field_name='updated_at', lookup_expr='lte')
    
    contact = django_filters.NumberFilter(field_name='chat_thread__contact__id')
    contact_name = django_filters.CharFilter(field_name='chat_thread__contact__name', lookup_expr='icontains')
    contact_phone = django_filters.CharFilter(field_name='chat_thread__contact__phone_number', lookup_expr='icontains')
    address = django_filters.CharFilter(field_name='chat_thread__address', lookup_expr='icontains')
    
    class Meta:
        model = Message
        fields = [
            'backup', 'chat_thread', 'body', 'body_exact', 'body_empty',
            'status', 'seen', 'sim_slot', 'date_after', 'date_before',
            'date_range', 'created_after', 'created_before', 'updated_after',
            'updated_before', 'contact', 'contact_name', 'contact_phone', 'address'
        ]
    
    def filter_body_empty(self, queryset, name, value):
        if value:
            return queryset.filter(Q(body__isnull=True) | Q(body=''))
        else:
            return queryset.filter(body__isnull=False).exclude(body='')
