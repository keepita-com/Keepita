from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'list', views.AlarmViewSet, basename='alarm')

app_name = 'alarms'

urlpatterns = [
    path('', include(router.urls)),
]
