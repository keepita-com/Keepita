from config.pagination import DefaultPagination
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from dashboard.models import Alarm, Backup

from .filters import AlarmFilter
from .serializers import AlarmDetailSerializer, AlarmSerializer

backup_pk_param = openapi.Parameter(
    'backup_pk', 
    openapi.IN_PATH, 
    description="The ID of the backup to access.", 
    type=openapi.TYPE_INTEGER,
    required=True
)

@swagger_auto_schema(manual_parameters=[backup_pk_param])  
class AlarmViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alarm.objects.all()
    serializer_class = AlarmSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AlarmFilter
    search_fields = ['name']
    ordering_fields = ['created_at', 'time', 'name', 'active']
    ordering = ['-created_at']
    pagination_class = DefaultPagination

    def get_queryset(self):
        
        
        if getattr(self, 'swagger_fake_view', False):
            return Alarm.objects.none()
        

        backup_pk = self.kwargs.get('backup_pk')
        queryset = Alarm.objects.filter(
            backup__user=self.request.user
        ).select_related('backup')
        
        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)
            
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AlarmDetailSerializer
        return AlarmSerializer

    @action(detail=False, methods=['get'])
    def statistics(self, request, *args, **kwargs): 
        queryset = self.filter_queryset(self.get_queryset())
        
        
        total_alarms = queryset.count()
        active_alarms = queryset.filter(active=True).count()
        inactive_alarms = total_alarms - active_alarms
        
        
        repeat_types = queryset.values('repeat_type').annotate(
            count=Count('id')
        ).order_by('repeat_type')
        
        
        time_distribution = {
            'morning': queryset.filter(time__hour__range=(6, 11)).count(),     
            'afternoon': queryset.filter(time__hour__range=(12, 17)).count(),  
            'evening': queryset.filter(time__hour__range=(18, 21)).count(),    
            'night': queryset.filter(
                Q(time__hour__range=(22, 23)) | Q(time__hour__range=(0, 5))
            ).count(),  
        }
        
        
        common_times = queryset.values('time').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        return Response({
            'total_alarms': total_alarms,
            'active_alarms': active_alarms,
            'inactive_alarms': inactive_alarms,
            'activity_rate': round((active_alarms / max(total_alarms, 1)) * 100, 2),
            'repeat_type_breakdown': list(repeat_types),
            'time_distribution': time_distribution,
            'common_times': list(common_times),
        })

    @action(detail=False, methods=['get'])
    def by_status(self, request, *args, **kwargs): 
        queryset = self.filter_queryset(self.get_queryset())
        
        active_alarms = queryset.filter(active=True).order_by('time')
        inactive_alarms = queryset.filter(active=False).order_by('time')
        
        return Response({
            'active': AlarmSerializer(active_alarms, many=True).data,
            'inactive': AlarmSerializer(inactive_alarms, many=True).data,
        })

    @action(detail=False, methods=['get'])
    def by_time_period(self, request, *args, **kwargs): 
        queryset = self.filter_queryset(self.get_queryset())
        
        morning = queryset.filter(time__hour__range=(6, 11)).order_by('time')
        afternoon = queryset.filter(time__hour__range=(12, 17)).order_by('time')
        evening = queryset.filter(time__hour__range=(18, 21)).order_by('time')
        night = queryset.filter(
            Q(time__hour__range=(22, 23)) | Q(time__hour__range=(0, 5))
        ).order_by('time')
        
        return Response({
            'morning': AlarmSerializer(morning, many=True).data,
            'afternoon': AlarmSerializer(afternoon, many=True).data,
            'evening': AlarmSerializer(evening, many=True).data,
            'night': AlarmSerializer(night, many=True).data,
        })

    @action(detail=False, methods=['get'])
    def recurring_alarms(self, request, *args, **kwargs): 
        queryset = self.filter_queryset(self.get_queryset())
        recurring = queryset.exclude(
            Q(repeat_type__isnull=True) | Q(repeat_type=0)
        ).order_by('time')
        
        return Response({
            'count': recurring.count(),
            'alarms': AlarmSerializer(recurring, many=True).data,
        })

    @action(detail=False, methods=['get'])
    def one_time_alarms(self, request, *args, **kwargs): 
        queryset = self.filter_queryset(self.get_queryset())
        one_time = queryset.filter(
            Q(repeat_type__isnull=True) | Q(repeat_type=0)
        ).order_by('time')
        
        return Response({
            'count': one_time.count(),
            'alarms': AlarmSerializer(one_time, many=True).data,
        })