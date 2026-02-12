from config.pagination import DefaultPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..models import Contact
from ..permissions import IsBackupOwner
from .filters import ContactFilter
from .serializers import ContactSerializer

backup_pk_param = openapi.Parameter(
    'backup_pk', 
    openapi.IN_PATH, 
    description="The ID of the backup to access.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class ContactViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filterset_class = ContactFilter
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    search_fields = ['name', 'phone_number']
    ordering_fields = ['name', 'is_favorite']
    ordering = ['name']
    pagination_class = DefaultPagination

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Contact.objects.none()

        queryset = Contact.objects.all()
        backup_id = self.kwargs.get('backup_pk')

        if backup_id:
            queryset = queryset.filter(backup_id=backup_id)

        user = getattr(getattr(self, 'request', None), 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return queryset.none()

        if not user.is_staff:
            queryset = queryset.filter(backup__user_id=user.pk)

        return queryset