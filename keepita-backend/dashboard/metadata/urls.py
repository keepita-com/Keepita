from django.urls import path

from . import views

app_name = 'metadata'

urlpatterns = [
    path('', views.MetadataDetailView.as_view(), name='metadata-detail'),
]