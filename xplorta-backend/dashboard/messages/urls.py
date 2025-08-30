from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"threads", views.ChatThreadViewSet, basename="chat-thread")

app_name = "messages"

urlpatterns = [
    path("", include(router.urls)),
    path(
        "threads/<int:thread_pk>/messages/",
        views.ThreadMessageViewSet.as_view({"get": "list"}),
        name="thread-messages-list",
    ),
]
