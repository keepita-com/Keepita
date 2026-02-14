from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'list', views.CallLogViewSet, basename='call-log')

app_name = 'call_logs'

urlpatterns = [
    path('', include(router.urls)),
]
