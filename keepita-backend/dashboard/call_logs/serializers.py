from rest_framework import serializers

from dashboard.models import CallLog, Contact

class CallLogSerializer(serializers.ModelSerializer):
    
    contact_name = serializers.SerializerMethodField()
    contact_id = serializers.SerializerMethodField()
    contact_phone = serializers.SerializerMethodField()
    
    call_type_display = serializers.SerializerMethodField()
    
    duration_display = serializers.SerializerMethodField()
    
    call_date_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = CallLog
        fields = [
            'id', 'number', 'name', 'date', 'call_date_formatted', 
            'type', 'call_type_display', 'duration', 'duration_display',
            'contact_name', 'contact_id', 'contact_phone', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_contact_name(self, obj):
        if obj.contact:
            return obj.contact.name or obj.contact.phone_number
        return obj.name
    
    def get_contact_id(self, obj):
        return obj.contact.id if obj.contact else None
    
    def get_contact_phone(self, obj):
        if obj.contact:
            return obj.contact.phone_number
        return obj.number
    
    def get_call_type_display(self, obj):
        type_mapping = {
            'INCOMING': 'Incoming',
            'OUTGOING': 'Outgoing', 
            'MISSED': 'Missed',
            'REJECTED': 'Rejected',
        }
        return type_mapping.get(obj.type, obj.type)
    
    def get_duration_display(self, obj):
        if not obj.duration:
            return "0s"
        
        hours = obj.duration // 3600
        minutes = (obj.duration % 3600) // 60
        seconds = obj.duration % 60
        
        if hours > 0:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"
    
    def get_call_date_formatted(self, obj):
        if obj.date:
            return obj.date.strftime('%Y-%m-%d %H:%M:%S')
        return None

class CallLogDetailSerializer(CallLogSerializer):
    
    backup_info = serializers.SerializerMethodField()
    
    class Meta(CallLogSerializer.Meta):
        fields = CallLogSerializer.Meta.fields + ['backup_info']
    
    def get_backup_info(self, obj):
        return {
            'id': obj.backup.id,
            'name': obj.backup.name,
            'created_at': obj.backup.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
