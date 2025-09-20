from django.db.models import Avg, Count, Q, Sum
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from config.pagination import DefaultPagination
from dashboard.models import Backup, CallLog

from .filters import CallLogFilter
from .serializers import CallLogSerializer


class CallLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CallLog.objects.all()
    serializer_class = CallLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CallLogFilter
    search_fields = ["number", "name"]
    ordering_fields = ["created_at", "date", "duration", "type"]
    ordering = ["-date"]
    pagination_class = DefaultPagination

    def get_queryset(self):
        backup_pk = self.kwargs.get("backup_pk")
        queryset = CallLog.objects.filter(
            backup__user=self.request.user
        ).select_related("backup", "contact")

        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)

        return queryset

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        total_calls = queryset.count()

        call_types = (
            queryset.values("type").annotate(count=Count("id")).order_by("type")
        )

        duration_stats = queryset.aggregate(
            total_duration=Sum("duration"),
            avg_duration=Avg("duration"),
            max_duration=queryset.order_by("-duration")
            .values_list("duration", flat=True)
            .first()
            or 0,
        )

        frequent_contacts = (
            queryset.exclude(number__isnull=True)
            .values("number", "name")
            .annotate(call_count=Count("id"), total_duration=Sum("duration"))
            .order_by("-call_count")[:10]
        )

        incoming_calls = queryset.filter(type="INCOMING").count()
        outgoing_calls = queryset.filter(type="OUTGOING").count()
        missed_calls = queryset.filter(type="MISSED").count()
        rejected_calls = queryset.filter(type="REJECTED").count()

        return Response(
            {
                "total_calls": total_calls,
                "call_types": list(call_types),
                "duration_statistics": duration_stats,
                "call_distribution": {
                    "incoming": incoming_calls,
                    "outgoing": outgoing_calls,
                    "missed": missed_calls,
                    "rejected": rejected_calls,
                    "others": total_calls
                    - (incoming_calls + outgoing_calls + missed_calls + rejected_calls),
                },
                "frequent_contacts": list(frequent_contacts),
            }
        )

    @action(detail=False, methods=["get"])
    def by_type(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        call_types = {
            "incoming": queryset.filter(type="INCOMING"),
            "outgoing": queryset.filter(type="OUTGOING"),
            "missed": queryset.filter(type="MISSED"),
            "rejected": queryset.filter(type="REJECTED"),
        }

        result = {}
        for type_name, type_queryset in call_types.items():
            result[type_name] = {
                "count": type_queryset.count(),
                "total_duration": type_queryset.aggregate(total=Sum("duration"))[
                    "total"
                ]
                or 0,
                "recent_calls": CallLogSerializer(
                    type_queryset.order_by("-date")[:5],
                    many=True,
                    context={"request": request},
                ).data,
            }

        return Response(result)

    @action(detail=False, methods=["get"])
    def frequent_contacts(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        frequent = (
            queryset.exclude(number__isnull=True)
            .values("number", "name")
            .annotate(
                call_count=Count("id"),
                total_duration=Sum("duration"),
                last_call=queryset.order_by("-date")
                .values_list("date", flat=True)
                .first(),
            )
            .order_by("-call_count")
        )

        return Response({"frequent_contacts": list(frequent)})

    @action(detail=False, methods=["get"])
    def recent(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        recent_calls = queryset.order_by("-date")[:50]

        serializer = self.get_serializer(recent_calls, many=True)
        return Response(
            {"count": recent_calls.count(), "recent_calls": serializer.data}
        )
