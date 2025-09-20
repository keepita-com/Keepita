from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from config.pagination import DefaultPagination
from dashboard.models import Backup, WifiNetwork

from .filters import WifiNetworkFilter
from .serializers import WifiNetworkDetailSerializer, WifiNetworkSerializer


class WifiNetworkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WifiNetwork.objects.all()
    serializer_class = WifiNetworkSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = WifiNetworkFilter
    search_fields = ["ssid", "backup__name", "backup__phone_number"]
    ordering_fields = ["created_at", "last_connected", "ssid", "security_type"]
    ordering = ["-created_at"]
    pagination_class = DefaultPagination

    def get_queryset(self):
        backup_pk = self.kwargs.get("backup_pk")
        queryset = WifiNetwork.objects.filter(
            backup__user=self.request.user
        ).select_related("backup")

        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)

        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return WifiNetworkDetailSerializer
        return WifiNetworkSerializer

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        total_networks = queryset.count()
        saved_networks = queryset.filter(is_saved=True).count()
        scanned_only = total_networks - saved_networks
        hidden_networks = queryset.filter(hidden=True).count()

        security_breakdown = (
            queryset.values("security_type")
            .annotate(count=Count("id"))
            .order_by("security_type")
        )

        frequency_distribution = {
            "2.4_ghz": queryset.filter(frequency__range=["2400", "2500"]).count(),
            "5_ghz": queryset.filter(frequency__range=["5000", "6000"]).count(),
            "unknown": queryset.filter(
                Q(frequency__isnull=True) | Q(frequency="")
            ).count(),
        }

        secure_networks = queryset.exclude(security_type="NONE").count()
        open_networks = queryset.filter(security_type="NONE").count()
        security_score = round((secure_networks / max(total_networks, 1)) * 100, 2)

        networks_with_passwords = queryset.exclude(
            Q(password__isnull=True) | Q(password="")
        ).count()

        from datetime import timedelta

        from django.utils import timezone

        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_connections = queryset.filter(
            last_connected__gte=thirty_days_ago
        ).count()

        return Response(
            {
                "total_networks": total_networks,
                "saved_networks": saved_networks,
                "scanned_only": scanned_only,
                "hidden_networks": hidden_networks,
                "networks_with_passwords": networks_with_passwords,
                "recent_connections": recent_connections,
                "security_score": security_score,
                "security_breakdown": list(security_breakdown),
                "frequency_distribution": frequency_distribution,
                "open_networks": open_networks,
                "secure_networks": secure_networks,
            }
        )

    @action(detail=False, methods=["get"])
    def by_security(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        security_groups = {}
        for security_type, _ in WifiNetwork.SECURITY_TYPES:
            networks = queryset.filter(security_type=security_type).order_by("ssid")
            security_groups[security_type] = WifiNetworkSerializer(
                networks, many=True
            ).data

        return Response(security_groups)

    @action(detail=False, methods=["get"])
    def by_frequency(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        freq_2_4 = queryset.filter(frequency__range=["2400", "2500"]).order_by("ssid")
        freq_5 = queryset.filter(frequency__range=["5000", "6000"]).order_by("ssid")
        unknown_freq = queryset.filter(
            Q(frequency__isnull=True) | Q(frequency="")
        ).order_by("ssid")

        return Response(
            {
                "2.4_ghz": WifiNetworkSerializer(freq_2_4, many=True).data,
                "5_ghz": WifiNetworkSerializer(freq_5, many=True).data,
                "unknown": WifiNetworkSerializer(unknown_freq, many=True).data,
            }
        )

    @action(detail=False, methods=["get"])
    def saved_networks(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        saved = queryset.filter(is_saved=True).order_by("ssid")

        return Response(
            {
                "count": saved.count(),
                "networks": WifiNetworkSerializer(saved, many=True).data,
            }
        )

    @action(detail=False, methods=["get"])
    def open_networks(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        open_nets = queryset.filter(security_type="NONE").order_by("ssid")

        return Response(
            {
                "count": open_nets.count(),
                "networks": WifiNetworkSerializer(open_nets, many=True).data,
            }
        )

    @action(detail=False, methods=["get"])
    def hidden_networks(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        hidden = queryset.filter(hidden=True).order_by("ssid")

        return Response(
            {
                "count": hidden.count(),
                "networks": WifiNetworkSerializer(hidden, many=True).data,
            }
        )

    @action(detail=False, methods=["get"])
    def recent_connections(self, request):
        from datetime import timedelta

        from django.utils import timezone

        queryset = self.filter_queryset(self.get_queryset())

        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent = queryset.filter(last_connected__gte=thirty_days_ago).order_by(
            "-last_connected"
        )

        return Response(
            {
                "count": recent.count(),
                "networks": WifiNetworkSerializer(recent, many=True).data,
            }
        )

    @action(detail=False, methods=["get"])
    def security_analysis(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        total = queryset.count()
        if total == 0:
            return Response({"error": "No networks found"}, status=400)

        security_stats = {}
        for security_type, display_name in WifiNetwork.SECURITY_TYPES:
            count = queryset.filter(security_type=security_type).count()
            percentage = round((count / total) * 100, 2)
            security_stats[security_type] = {
                "name": display_name,
                "count": count,
                "percentage": percentage,
            }

        high_risk = queryset.filter(security_type="NONE").count()
        medium_risk = queryset.filter(security_type__in=["WPA_PSK"]).count()
        low_risk = queryset.filter(
            security_type__in=["WPA2_PSK", "WPA_WPA2_PSK", "SAE", "EAP"]
        ).count()

        risk_assessment = {
            "high_risk": {
                "count": high_risk,
                "percentage": round((high_risk / total) * 100, 2),
            },
            "medium_risk": {
                "count": medium_risk,
                "percentage": round((medium_risk / total) * 100, 2),
            },
            "low_risk": {
                "count": low_risk,
                "percentage": round((low_risk / total) * 100, 2),
            },
        }

        score = (low_risk * 100 + medium_risk * 60 + high_risk * 0) / total

        return Response(
            {
                "total_networks": total,
                "security_breakdown": security_stats,
                "risk_assessment": risk_assessment,
                "overall_security_score": round(score, 2),
                "recommendations": self._get_security_recommendations(
                    high_risk, medium_risk, low_risk
                ),
            }
        )

    def _get_security_recommendations(self, high_risk, medium_risk, low_risk):
        recommendations = []

        if high_risk > 0:
            recommendations.append(
                {
                    "type": "critical",
                    "message": f"Found {high_risk} open networks. Avoid connecting to open networks as they pose security risks.",
                }
            )

        if medium_risk > 0:
            recommendations.append(
                {
                    "type": "warning",
                    "message": f"Found {medium_risk} networks with WPA security. Consider upgrading to WPA2 or WPA3 for better security.",
                }
            )

        if low_risk > 0:
            recommendations.append(
                {
                    "type": "info",
                    "message": f"{low_risk} networks have good security (WPA2/WPA3). Keep using strong passwords.",
                }
            )

        return recommendations
