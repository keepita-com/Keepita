from django.conf import settings
from rest_framework import permissions
from rest_framework.permissions import BasePermission

from dashboard.models import Backup


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.user == request.user

        return obj.user == request.user


class IsBackupOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not hasattr(view, "kwargs") or "backup_pk" not in view.kwargs:
            return True

        backup_pk = view.kwargs.get("backup_pk")
        if backup_pk:
            try:
                backup = Backup.objects.get(pk=backup_pk)
                return backup.user == request.user
            except Backup.DoesNotExist:
                return False

        return True

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "user"):
            return obj.user == request.user

        if hasattr(obj, "backup"):
            return obj.backup.user == request.user

        return False


class IsBackupOwnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff or request.user.is_superuser:
            return True

        if not hasattr(view, "kwargs") or "backup_pk" not in view.kwargs:
            return True

        backup_pk = view.kwargs.get("backup_pk")
        if backup_pk:
            try:
                backup = Backup.objects.get(pk=backup_pk)
                return backup.user == request.user
            except Backup.DoesNotExist:
                return False

        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.is_superuser:
            return True

        if hasattr(obj, "user"):
            return obj.user == request.user

        if hasattr(obj, "backup"):
            return obj.backup.user == request.user

        return False


class UserMediaPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.is_superuser:
            return True
        return hasattr(obj, "user") and obj.user == request.user
