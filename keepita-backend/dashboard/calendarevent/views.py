from config.pagination import DefaultPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..models import Backup, CalendarEvent
from ..permissions import IsBackupOwner
from .filters import CalendarEventFilter
from .serializers import CalendarEventSerializer

backup_pk_param = openapi.Parameter(
    'backup_pk', 
    openapi.IN_PATH, 
    description="The ID of the backup to access.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class CalendarEventViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = CalendarEventSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filterset_class = CalendarEventFilter
    pagination_class = DefaultPagination

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    search_fields = ['summary', 'location']
    
    ordering_fields = ['start_date', 'end_date', 'summary']
    
    ordering = ['-start_date']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return CalendarEvent.objects.none()

        user = getattr(getattr(self, 'request', None), 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return CalendarEvent.objects.none()

        backup_id = self.kwargs.get('backup_pk')
        queryset = CalendarEvent.objects.all()

        if backup_id:
            queryset = queryset.filter(backup_id=backup_id)

        if not user.is_staff:
            queryset = queryset.filter(backup__user_id=user.pk)

        return queryset