from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"backups", views.BackupViewSet)
router.register(r"notifications", views.NotificationViewSet, basename="notification")


urlpatterns = [
    path("", include(router.urls)),
    path("backups/<int:backup_pk>/files/", include("dashboard.files.urls")),
    path("backups/<int:backup_pk>/contacts/", include("dashboard.contacts.urls")),
    path("backups/<int:backup_pk>/apps/", include("dashboard.apps.urls")),
    path("backups/<int:backup_pk>/homescreen/", include("dashboard.homescreen.urls")),
    path("backups/<int:backup_pk>/messages/", include("dashboard.messages.urls")),
    path("backups/<int:backup_pk>/bluetooth/", include("dashboard.bluetooth.urls")),
    path("backups/<int:backup_pk>/call_logs/", include("dashboard.call_logs.urls")),
    path("backups/<int:backup_pk>/alarms/", include("dashboard.alarms.urls")),
    path("backups/<int:backup_pk>/wifi/", include("dashboard.wifi.urls")),
    path("backups/<int:backup_pk>/browser/", include("dashboard.browser.urls")),
    path("backups/progress/<uuid:pk>/",views.BackupProgressView.as_view(),name="backup-progress"),
    path("status/", views.DashboardView.as_view(), name="dashboard-stats"),
    path("backups/statistics", views.BackupstatView.as_view(), name="dashboard-summary"),
    path('files/<int:pk>/download/', views.FileDownloadView.as_view(), name='file-download'),
]
