from rest_framework import serializers

from dashboard.models import BackupMetadata

class BackupMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupMetadata
        fields = [
            'id',
            'device_name',
            'miui_version',
            'backup_version',
            'is_auto_backup',
            'backup_date',
            'backup_size',
            'storage_left',
            'created_at'
        ]