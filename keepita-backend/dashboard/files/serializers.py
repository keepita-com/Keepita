from rest_framework import serializers

from ..models import Backup, File
from ..utils.storage import generate_presigned_url

class FileSerializer(serializers.ModelSerializer):
    file_size_human = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    class Meta:
        model = File
        fields = ['id', 'backup', 'file_name', 'file', 'file_size', 
                 'file_size_human', 'file_extension', 'mime_type',
                 'category', 'created_date', 'modified_date']
        
    def get_file_size_human(self, obj):
        for unit in ['B', 'KB', 'MB', 'GB']:
            if obj.file_size < 1024:
                return f"{obj.file_size:.1f} {unit}"
            obj.file_size /= 1024
        return f"{obj.file_size:.1f} TB"
    
    def get_file(self, obj):
        return generate_presigned_url(obj.file)