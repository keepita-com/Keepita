from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'list', views.NoteViewSet, basename='note-list')
app_name = 'notes'

urlpatterns = [
    path('', include(router.urls)),
]