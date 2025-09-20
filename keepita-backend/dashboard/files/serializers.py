from rest_framework import serializers

from ..models import Backup, File


class FileSerializer(serializers.ModelSerializer):
    file_size_human = serializers.SerializerMethodField()
    class Meta:
        model = File
        fields = [
            "id",
            "backup",
            "file_name",
            "file",
            "file_size",
            "file_size_human",
            "file_extension",
            "mime_type",
            "category",
            "created_date",
            "modified_date",
        ]

    def get_file_size_human(self, obj):
        for unit in ["B", "KB", "MB", "GB"]:
            if obj.file_size < 1024:
                return f"{obj.file_size:.1f} {unit}"
            obj.file_size /= 1024
        return f"{obj.file_size:.1f} TB"
