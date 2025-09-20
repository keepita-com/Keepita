from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from config.pagination import DefaultPagination

from ..models import Contact
from ..permissions import IsBackupOwner
from .filters import ContactFilter
from .serializers import ContactSerializer


class ContactViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filterset_class = ContactFilter
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name", "phone_number"]
    ordering_fields = ["name", "is_favorite"]
    ordering = ["name"]
    pagination_class = DefaultPagination

    def get_queryset(self):
        queryset = Contact.objects.all()
        backup_id = self.kwargs.get("backup_pk")

        if backup_id:
            queryset = queryset.filter(backup_id=backup_id)

        if not self.request.user.is_staff:
            queryset = queryset.filter(backup__user=self.request.user)

        return queryset
