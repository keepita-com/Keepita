from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'', views.CalendarEventViewSet, basename='calendar-event')

urlpatterns = [
    path('', include(router.urls)),
]