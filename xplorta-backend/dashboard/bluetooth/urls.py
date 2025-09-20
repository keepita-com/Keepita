from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"devices", views.BluetoothDeviceViewSet, basename="bluetooth-device")

app_name = "bluetooth"

urlpatterns = [
    path("", include(router.urls)),
]
