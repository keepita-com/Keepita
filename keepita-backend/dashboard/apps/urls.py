from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'list', views.ApkListViewSet, basename='apk-list')
app_name = 'apps'

urlpatterns = [
    path('', include(router.urls)),
    
    path('list/<int:app_id>/permissions/', views.AppPermissionsView.as_view(), name='app-permissions'),
]