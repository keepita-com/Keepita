from django.db.models import Count, Max
from rest_framework import serializers

from dashboard.models import ChatThread, Contact, Message


class ContactBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ["id", "name", "phone_number", "profile_image", "is_favorite"]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id",
            "date",
            "body",
            "status",
            "seen",
            "sim_slot",
            "created_at",
            "updated_at",
        ]


class ChatThreadListSerializer(serializers.ModelSerializer):
    contact = ContactBasicSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    last_message_date = serializers.SerializerMethodField()
    messages_count = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatThread
        fields = [
            "id",
            "address",
            "contact",
            "created_at",
            "last_message",
            "last_message_date",
            "messages_count",
            "unread_count",
        ]

    def get_last_message(self, obj):
        last_message = obj.messages.order_by("-date").first()
        if last_message:
            return last_message.body[:100] + (
                "..." if len(last_message.body or "") > 100 else ""
            )
        return None

    def get_last_message_date(self, obj):
        last_message = obj.messages.order_by("-date").first()
        return last_message.date if last_message else obj.created_at

    def get_messages_count(self, obj):
        return obj.messages.count()

    def get_unread_count(self, obj):
        return obj.messages.filter(seen=False).count()


class ChatThreadDetailSerializer(serializers.ModelSerializer):
    contact = ContactBasicSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    messages_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatThread
        fields = [
            "id",
            "address",
            "contact",
            "created_at",
            "messages",
            "messages_count",
        ]

    def get_messages_count(self, obj):
        return obj.messages.count()


class ChatThreadOverviewSerializer(serializers.ModelSerializer):
    contact = ContactBasicSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    last_message_date = serializers.SerializerMethodField()
    messages_count = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    first_message_date = serializers.SerializerMethodField()
    date_range = serializers.SerializerMethodField()

    class Meta:
        model = ChatThread
        fields = [
            "id",
            "address",
            "contact",
            "created_at",
            "last_message",
            "last_message_date",
            "messages_count",
            "unread_count",
            "first_message_date",
            "date_range",
        ]

    def get_last_message(self, obj):
        last_message = obj.messages.order_by("-date").first()
        return last_message.body if last_message else None

    def get_last_message_date(self, obj):
        last_message = obj.messages.order_by("-date").first()
        return last_message.date if last_message else None

    def get_messages_count(self, obj):
        return obj.messages.count()

    def get_unread_count(self, obj):
        return obj.messages.filter(seen=False).count()

    def get_first_message_date(self, obj):
        first_message = obj.messages.order_by("date").first()
        return first_message.date if first_message else None

    def get_date_range(self, obj):
        messages = obj.messages.order_by("date")
        if messages.exists():
            first = messages.first().date
            last = messages.last().date
            return {
                "start": first,
                "end": last,
                "duration_days": (last - first).days if first and last else 0,
            }
        return None
