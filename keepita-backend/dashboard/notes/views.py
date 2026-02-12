from config.pagination import DefaultPagination
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from dashboard.models import Backup, Note
from dashboard.permissions import IsBackupOwner

from .filters import NoteFilter
from .serializers import NoteSerializer

backup_pk_param = openapi.Parameter(
    'backup_pk', 
    openapi.IN_PATH, 
    description="The ID of the backup to access.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class NoteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = NoteFilter
    search_fields = ['title', 'body']
    
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):

        if getattr(self, 'swagger_fake_view', False):
            return Note.objects.none()

        user = getattr(getattr(self, 'request', None), 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return Note.objects.none()

        backup_id = self.kwargs.get('backup_pk')

        backup = get_object_or_404(Backup, id=backup_id, user_id=user.pk)
        return Note.objects.filter(backup=backup)