from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from config.pagination import DefaultPagination

from ..models import File
from .filters import FileFilter
from .serializers import FileSerializer


class FileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = FileFilter
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["file_name", "category"]
    ordering_fields = ["file_name", "file_size", "created_date", "modified_date"]
    ordering = ["-created_date"]
    pagination_class = DefaultPagination

    def get_queryset(self):
        queryset = File.objects.all()
        backup_id = self.kwargs.get("backup_pk")

        if backup_id:
            queryset = queryset.filter(backup_id=backup_id)

        if not self.request.user.is_staff:
            queryset = queryset.filter(backup__user=self.request.user)

        return queryset
