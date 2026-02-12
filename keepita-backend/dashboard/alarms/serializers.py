from rest_framework import serializers

from dashboard.models import Alarm

class AlarmSerializer(serializers.ModelSerializer):
    
    time_display = serializers.SerializerMethodField()
    
    repeat_type_display = serializers.SerializerMethodField()
    
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Alarm
        fields = [
            'id', 'name', 'time', 'time_display', 'active', 'status_display',
            'repeat_type', 'repeat_type_display', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_time_display(self, obj):
        if obj.time:
            return obj.time.strftime('%H:%M')
        return None
    
    def get_repeat_type_display(self, obj):
        if obj.repeat_type is None:
            return 'Once'
        
        repeat_mapping = {
            0: 'Once',
            1: 'Daily',
            2: 'Weekly',
            3: 'Weekdays',
            4: 'Weekends',
            127: 'Every day',
        }
        
        return repeat_mapping.get(obj.repeat_type, f'Custom ({obj.repeat_type})')
    
    def get_status_display(self, obj):
        if obj.active:
            return '🔔 Active'
        return '🔕 Inactive'

class AlarmDetailSerializer(AlarmSerializer):
    
    backup_phone_number = serializers.CharField(source='backup.phone_number', read_only=True)
    backup_model = serializers.CharField(source='backup.model_name', read_only=True)
    
    class Meta(AlarmSerializer.Meta):
        fields = AlarmSerializer.Meta.fields + [
            'backup_phone_number', 'backup_model'
        ]
