
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'layouts', views.IOSHomeScreenLayoutViewSet, basename='ios-homescreen-layout')
router.register(r'items', views.IOSHomeScreenItemViewSet, basename='ios-homescreen-item')
router.register(r'wallpapers', views.WallpaperViewSet, basename='wallpaper')

app_name = 'ios_homescreen'

urlpatterns = [
    path('', include(router.urls)),
]