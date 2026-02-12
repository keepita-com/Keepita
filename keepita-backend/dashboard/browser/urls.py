from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (BrowserBookmarkViewSet, BrowserDownloadViewSet,
                    BrowserHistoryViewSet, BrowserOverviewViewSet,
                    BrowserSearchViewSet, BrowserTabViewSet)

router = DefaultRouter()
router.register(r'bookmarks', BrowserBookmarkViewSet, basename='browser-bookmarks')
router.register(r'history', BrowserHistoryViewSet, basename='browser-history')
router.register(r'downloads', BrowserDownloadViewSet, basename='browser-downloads')
router.register(r'searches', BrowserSearchViewSet, basename='browser-searches')
router.register(r'tabs', BrowserTabViewSet, basename='browser-tabs')
router.register(r'overview', BrowserOverviewViewSet, basename='browser-overview')

app_name = 'browser'

urlpatterns = [
    path('', include(router.urls)),
]
