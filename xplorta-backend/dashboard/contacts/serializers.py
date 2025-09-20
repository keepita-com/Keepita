from rest_framework import serializers

from ..models import Backup, Contact
from ..utils.storage import generate_presigned_url


class ContactSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Contact
        fields = [
            "id",
            "backup",
            "name",
            "profile_image",
            "phone_number",
            "date_of_birth",
            "is_favorite",
        ]

    def get_profile_image(self, obj):
        return generate_presigned_url(obj.profile_image)
