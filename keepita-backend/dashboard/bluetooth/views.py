from config.pagination import DefaultPagination
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from dashboard.models import Backup, BluetoothDevice

from .filters import BluetoothDeviceFilter
from .serializers import (BluetoothDeviceDetailSerializer,
                          BluetoothDeviceSerializer,
                          BluetoothOverviewSerializer)

backup_pk_param = openapi.Parameter(
    'backup_pk', 
    openapi.IN_PATH, 
    description="The ID of the backup to access.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class BluetoothDeviceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BluetoothDevice.objects.all()
    serializer_class = BluetoothDeviceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BluetoothDeviceFilter
    search_fields = ['name', 'address']
    ordering_fields = ['name', 'address', 'last_connected', 'created_at']
    ordering = ['-last_connected']
    pagination_class = DefaultPagination

    def get_queryset(self):
        
        
        if getattr(self, 'swagger_fake_view', False):
            return BluetoothDevice.objects.none()
        

        backup_pk = self.kwargs.get('backup_pk')
        
        
        queryset = BluetoothDevice.objects.filter(
            backup__user=self.request.user
        ).select_related('backup')
        
        
        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)
        
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BluetoothDeviceDetailSerializer
        return BluetoothDeviceSerializer

    @action(detail=False, methods=['get'])
    def paired(self, request, *args, **kwargs): 
        queryset = self.get_queryset().filter(bond_state__gt=0)
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            serializer.data
        })

    @action(detail=False, methods=['get'])
    def recently_connected(self, request, *args, **kwargs): 
        queryset = self.get_queryset().filter(last_connected__isnull=False).order_by('-last_connected')
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            serializer.data
        })

    @action(detail=False, methods=['get'])
    def by_class(self, request, *args, **kwargs): 
        queryset = self.get_queryset()
        device_classes = queryset.values('device_class').annotate(
            count=Count('id')
        ).order_by('-count')
        
        result = {}
        for device_class_data in device_classes:
            device_class = device_class_data['device_class']
            devices = queryset.filter(device_class=device_class)
            serializer = self.get_serializer(devices, many=True)
        
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request, *args, **kwargs): 
        backup_pk = self.kwargs.get('backup_pk')
        queryset = self.get_queryset()
        
        
        total_devices = queryset.count()
        paired_devices = queryset.filter(bond_state__gt=0).count()
        recently_connected = queryset.filter(last_connected__isnull=False).count()
        
        
        device_classes = queryset.values('device_class').annotate(
            count=Count('id')
        ).order_by('-count')
        device_classes_breakdown = {
            str(item['device_class']): item['count'] 
            for item in device_classes
        }
        
        
        last_paired_device = queryset.filter(bond_state__gt=0).order_by('-created_at').first()
        most_recent_connection = queryset.filter(last_connected__isnull=False).order_by('-last_connected').first()
        
        overview_data = {
            'total_devices': total_devices,
            'paired_devices': paired_devices,
            'recently_connected': recently_connected,
            'device_classes_breakdown': device_classes_breakdown,
            'last_paired_device': last_paired_device,
            'most_recent_connection': most_recent_connection
        }
        
        serializer = BluetoothOverviewSerializer(overview_data)
        return Response({
            'backup_id': backup_pk,
            'overview': serializer.data
        })

    @action(detail=False, methods=['get'])
    def search_devices(self, request, *args, **kwargs): 
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'Query parameter "q" is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        devices = self.get_queryset().filter(
            Q(name__icontains=query) |
            Q(address__icontains=query)
        )[:50]
        
        results = []
        for device in devices:
            
            highlighted_name = device.name or ''
            highlighted_address = device.address or ''
            
            if query.lower() in highlighted_name.lower():
                highlighted_name = highlighted_name.replace(query, f"<mark>{query}</mark>")
            if query.lower() in highlighted_address.lower():
                highlighted_address = highlighted_address.replace(query, f"<mark>{query}</mark>")
            
            results.append({
                'device_id': device.id,
                'name': device.name,
                'highlighted_name': highlighted_name,
                'address': device.address,
                'highlighted_address': highlighted_address,
                'device_class': device.device_class,
                'bond_state': device.bond_state,
                'last_connected': device.last_connected
            })
        
        return Response({
            'query': query,
            'total_results': len(results),
            'results': results
        })