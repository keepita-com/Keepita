from rest_framework import serializers

from dashboard.models import BluetoothDevice

class BluetoothDeviceSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = BluetoothDevice
        fields = [
            'id', 'name', 'address', 'device_class', 'appearance',
            'last_connected', 'bond_state', 'link_type', 'uuids',
            'manufacturer_data', 'created_at', 'backup'
        ]
        read_only_fields = ['id', 'created_at', 'backup']

class BluetoothDeviceDetailSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = BluetoothDevice
        fields = [
            'id', 'name', 'address', 'device_class', 'appearance',
            'last_connected', 'bond_state', 'link_type', 'uuids',
            'manufacturer_data', 'created_at', 'backup'
        ]
        read_only_fields = ['id', 'created_at', 'backup']

class BluetoothOverviewSerializer(serializers.Serializer):
    total_devices = serializers.IntegerField()
    paired_devices = serializers.IntegerField()
    recently_connected = serializers.IntegerField()
    device_classes_breakdown = serializers.DictField()
    last_paired_device = BluetoothDeviceSerializer(allow_null=True)
    most_recent_connection = BluetoothDeviceSerializer(allow_null=True)
