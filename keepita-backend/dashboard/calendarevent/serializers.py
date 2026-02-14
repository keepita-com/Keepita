from rest_framework import serializers

from ..models import CalendarEvent

class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = [
            'id',
            'backup',
            'summary',
            'start_date',
            'end_date',
            'location'
        ]