from rest_framework import serializers
from dashboard.models import Note

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = [
            'id',
            'note_id',
            'title',
            'body',
            'created_at',
        ]