from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from dashboard.models import Backup, BackupMetadata
from dashboard.permissions import IsBackupOwner
from .serializers import BackupMetadataSerializer

backup_pk_param = openapi.Parameter(
    'backup_pk', 
    openapi.IN_PATH, 
    description="The ID of the backup to access.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class MetadataDetailView(generics.RetrieveAPIView):
    serializer_class = BackupMetadataSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]

    queryset = BackupMetadata.objects.all()

    def get_object(self):
        
        if getattr(self, 'swagger_fake_view', False):
            
            
            
            return None
        

        backup_id = self.kwargs.get('backup_pk')

        backup = get_object_or_404(Backup, id=backup_id, user=self.request.user)

        return get_object_or_404(BackupMetadata, backup=backup)