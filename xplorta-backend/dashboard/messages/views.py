from django.db.models import Count, Max, Min, Prefetch, Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from config.pagination import DefaultPagination
from dashboard.models import Backup, ChatThread, Message

from .filters import ChatThreadFilter, MessageFilter
from .serializers import (
    ChatThreadDetailSerializer,
    ChatThreadListSerializer,
    ChatThreadOverviewSerializer,
    MessageSerializer,
)


class ChatThreadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ChatThread.objects.all()
    serializer_class = ChatThreadListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ChatThreadFilter
    search_fields = ["address", "contact__name", "contact__phone_number"]
    ordering_fields = ["created_at", "address"]
    ordering = ["-created_at"]
    pagination_class = DefaultPagination
    ordering = ["-created_at"]
    pagination_class = DefaultPagination

    def get_queryset(self):
        backup_pk = self.kwargs.get("backup_pk")

        queryset = (
            ChatThread.objects.filter(backup__user=self.request.user)
            .select_related("contact", "backup")
            .prefetch_related(
                Prefetch(
                    "messages",
                    queryset=Message.objects.order_by("-date"),
                    to_attr="ordered_messages",
                )
            )
            .annotate(
                messages_count=Count("messages"),
                unread_count=Count("messages", filter=Q(messages__seen=False)),
                last_message_date=Max("messages__date"),
            )
        )

        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)

        return queryset.order_by("-last_message_date", "-created_at")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ChatThreadDetailSerializer
        elif self.action == "overview":
            return ChatThreadOverviewSerializer
        return ChatThreadListSerializer

    @action(detail=True, methods=["get"])
    def overview(self, request, pk=None):
        thread = self.get_object()
        serializer = ChatThreadOverviewSerializer(thread, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        backup_pk = self.kwargs.get("backup_pk")

        queryset = self.get_queryset()
        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)

        total_threads = queryset.count()
        threads_with_messages = (
            queryset.filter(messages__isnull=False).distinct().count()
        )
        threads_with_unread = queryset.filter(messages__seen=False).distinct().count()

        from django.db.models import Avg, Sum

        message_stats = queryset.aggregate(
            total_messages=Sum("messages_count"),
            avg_messages_per_thread=Avg("messages_count"),
            total_unread=Sum("unread_count"),
        )

        most_active = queryset.order_by("-messages_count")[:10].values(
            "id", "address", "contact__name", "messages_count"
        )

        return Response(
            {
                "backup_id": backup_pk,
                "totals": {
                    "chat_threads": total_threads,
                    "threads_with_messages": threads_with_messages,
                    "threads_with_unread": threads_with_unread,
                    "total_messages": message_stats["total_messages"] or 0,
                    "total_unread": message_stats["total_unread"] or 0,
                    "avg_messages_per_thread": round(
                        message_stats["avg_messages_per_thread"] or 0, 2
                    ),
                },
                "most_active_threads": list(most_active),
            }
        )


class ThreadMessageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MessageFilter
    search_fields = ["body"]
    ordering_fields = ["date", "created_at", "status", "seen"]
    ordering = ["-date"]
    pagination_class = DefaultPagination

    def get_queryset(self):
        backup_pk = self.kwargs.get("backup_pk")
        thread_pk = self.kwargs.get("thread_pk")

        thread = get_object_or_404(
            ChatThread,
            id=thread_pk,
            backup_id=backup_pk,
            backup__user=self.request.user,
        )

        return (
            Message.objects.filter(chat_thread=thread)
            .select_related("chat_thread", "chat_thread__contact")
            .order_by("-date")
        )

    @action(detail=False, methods=["get"])
    def statistics(self, request, backup_pk=None, thread_pk=None):
        messages = self.get_queryset()

        total_messages = messages.count()
        unread_messages = messages.filter(seen=False).count()

        status_breakdown = (
            messages.values("status").annotate(count=Count("id")).order_by("status")
        )

        sim_breakdown = (
            messages.values("sim_slot").annotate(count=Count("id")).order_by("sim_slot")
        )

        first_message = messages.order_by("date").first()
        last_message = messages.order_by("-date").first()

        return Response(
            {
                "thread_id": thread_pk,
                "totals": {
                    "messages": total_messages,
                    "unread": unread_messages,
                    "read": total_messages - unread_messages,
                    "read_percentage": (
                        round(
                            (total_messages - unread_messages) / total_messages * 100, 2
                        )
                        if total_messages > 0
                        else 0
                    ),
                },
                "date_range": {
                    "first_message": first_message.date if first_message else None,
                    "last_message": last_message.date if last_message else None,
                    "duration_days": (
                        (last_message.date - first_message.date).days
                        if first_message and last_message
                        else 0
                    ),
                },
                "status_breakdown": list(status_breakdown),
                "sim_breakdown": list(sim_breakdown),
            }
        )

    @action(detail=False, methods=["get"])
    def search(self, request, backup_pk=None, thread_pk=None):
        query = request.query_params.get("q", "")
        if not query:
            return Response(
                {"error": 'Query parameter "q" is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        messages = self.get_queryset().filter(body__icontains=query)[:50]

        results = []
        for message in messages:
            highlighted_body = message.body
            if query.lower() in highlighted_body.lower():
                highlighted_body = highlighted_body.replace(
                    query, f"<mark>{query}</mark>"
                )

            results.append(
                {
                    "message_id": message.id,
                    "body": message.body,
                    "highlighted_body": highlighted_body,
                    "date": message.date,
                    "seen": message.seen,
                    "status": message.status,
                }
            )

        return Response(
            {
                "thread_id": thread_pk,
                "query": query,
                "total_results": len(results),
                "results": results,
            }
        )
