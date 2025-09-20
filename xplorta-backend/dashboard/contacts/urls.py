from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"", views.ContactViewSet, basename="contact")

urlpatterns = [
    path("", include(router.urls)),
]
