from rest_framework import serializers
from dashboard.models import WifiNetwork

class WifiNetworkSerializer(serializers.ModelSerializer):
    
    security_display = serializers.SerializerMethodField()
    
    status_display = serializers.SerializerMethodField()
    
    connection_status = serializers.SerializerMethodField()
    
    last_connected_display = serializers.SerializerMethodField()
    
    frequency_display = serializers.SerializerMethodField()
    
    class Meta:
        model = WifiNetwork
        fields = [
            'id', 'ssid', 'security_type', 'security_display', 'password',
            'hidden', 'frequency', 'frequency_display', 'last_connected',
            'last_connected_display', 'is_saved', 'status_display',
            'connection_status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_security_display(self, obj):
        security_icons = {
            'NONE': 'Open',
            'WPA_PSK': 'WPA',
            'WPA2_PSK': 'WPA2',
            'WPA_WPA2_PSK': 'WPA/WPA2',
            'SAE': 'WPA3',
            'EAP': 'Enterprise',
            'OTHER': 'Other'
        }
        return security_icons.get(obj.security_type, f'{obj.security_type}')
    
    def get_status_display(self, obj):
        if obj.hidden:
            return 'Hidden'
        return 'Visible'
    
    def get_connection_status(self, obj):
        if obj.is_saved:
            if obj.last_connected:
                return 'Saved & Connected'
            return 'Saved'
        return 'Scanned Only'
    
    def get_last_connected_display(self, obj):
        if obj.last_connected:
            return obj.last_connected.strftime('%Y-%m-%d %H:%M')
        return 'Never'
    
    def get_frequency_display(self, obj):
        if not obj.frequency:
            return 'Unknown'
        
        try:
            freq = int(obj.frequency)
            if 2400 <= freq <= 2500:
                return f'{obj.frequency} MHz (2.4 GHz)'
            elif 5000 <= freq <= 6000:
                return f'{obj.frequency} MHz (5 GHz)'
            else:
                return f'{obj.frequency} MHz'
        except (ValueError, TypeError):
            return obj.frequency

class WifiNetworkDetailSerializer(WifiNetworkSerializer):
    
    backup_phone_number = serializers.CharField(source='backup.phone_number', read_only=True)
    backup_model = serializers.CharField(source='backup.model_name', read_only=True)
    
    security_strength = serializers.SerializerMethodField()
    
    class Meta(WifiNetworkSerializer.Meta):
        fields = WifiNetworkSerializer.Meta.fields + [
            'backup_phone_number', 'backup_model', 'security_strength', 'password'
        ]
    
    def get_security_strength(self, obj):
        strength_mapping = {
            'NONE': {'level': 'Very Low', 'color': 'red', 'score': 0},
            'WPA_PSK': {'level': 'Medium', 'color': 'orange', 'score': 60},
            'WPA2_PSK': {'level': 'Good', 'color': 'yellow', 'score': 80},
            'WPA_WPA2_PSK': {'level': 'Good', 'color': 'yellow', 'score': 80},
            'SAE': {'level': 'Excellent', 'color': 'green', 'score': 100},
            'EAP': {'level': 'Excellent', 'color': 'green', 'score': 100},
        }
        return strength_mapping.get(obj.security_type, {'level': 'Unknown', 'color': 'gray', 'score': 50})
    
