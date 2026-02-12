from config.pagination import DefaultPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..models import File
from .filters import FileFilter
from .serializers import FileSerializer

backup_pk_param = openapi.Parameter(
    'backup_pk', 
    openapi.IN_PATH, 
    description="The ID of the backup to access.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class FileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = FileFilter
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    search_fields = ['file_name', 'category']
    ordering_fields = ['file_name', 'file_size', 'created_date', 'modified_date']
    ordering = ['-created_date']
    pagination_class = DefaultPagination

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return File.objects.none()

        queryset = File.objects.all()
        backup_id = self.kwargs.get('backup_pk')

        if backup_id:
            queryset = queryset.filter(backup_id=backup_id)

        user = getattr(getattr(self, 'request', None), 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return queryset.none()

        if not user.is_staff:
            queryset = queryset.filter(backup__user_id=user.pk)

        return queryset