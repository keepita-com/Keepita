import boto3
from rest_framework import serializers

from dashboard.models import ApkList, ApkPermission

from ..utils.storage import generate_presigned_url


class ApkPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApkPermission
        fields = [
            "id",
            "permission_name",
            "permission_group",
            "status",
            "flags",
            "protection_level",
            "created_at",
        ]


class ApkListSerializer(serializers.ModelSerializer):
    icon_url = serializers.SerializerMethodField()
    size_mb = serializers.SerializerMethodField()
    permissions_count = serializers.SerializerMethodField()

    class Meta:
        model = ApkList
        fields = [
            "id",
            "apk_name",
            "icon",
            "icon_url",
            "version_name",
            "size",
            "size_mb",
            "last_time_used",
            "recent_used",
            "permissions_count",
            "created_at",
        ]

    def get_icon_url(self, obj):
        return generate_presigned_url(obj.icon)

    def get_size_mb(self, obj):
        if obj.size:
            return round(obj.size / (1024 * 1024), 2)
        return None

    def get_permissions_count(self, obj):
        return obj.permissions.count()


class ApkListDetailSerializer(ApkListSerializer):
    permissions = ApkPermissionSerializer(many=True, read_only=True)

    class Meta(ApkListSerializer.Meta):
        fields = ApkListSerializer.Meta.fields + ["permissions"]


class ApkOverviewSerializer(serializers.Serializer):
    total_apps = serializers.IntegerField()
    recently_used_apps = serializers.IntegerField()
    total_size_mb = serializers.FloatField()
    total_permissions = serializers.IntegerField()
    most_recent_app = ApkListSerializer(allow_null=True)
    largest_app = ApkListSerializer(allow_null=True)
    apps_by_size_range = serializers.DictField()
