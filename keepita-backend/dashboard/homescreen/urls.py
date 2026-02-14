from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'layouts', views.HomeScreenLayoutViewSet, basename='homescreen-layout')
router.register(r'folders', views.HomeScreenFolderViewSet, basename='homescreen-folder')
router.register(r'items', views.HomeScreenItemViewSet, basename='homescreen-item')
router.register(r'wallpapers', views.WallpaperViewSet, basename='wallpaper')

app_name = 'homescreen'

urlpatterns = [

    path('', include(router.urls)),
    
    path('complete/', views.HomeScreenCompleteView.as_view(), name='complete'),
    path('visual_grid/', views.HomeScreenVisualGridView.as_view(), name='visual-grid'),
]
