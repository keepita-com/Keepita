from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"list", views.WifiNetworkViewSet, basename="wifi-network")

app_name = "wifi"

urlpatterns = [
    path("", include(router.urls)),
]
