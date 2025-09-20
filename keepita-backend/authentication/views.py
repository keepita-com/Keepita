import logging

import requests
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.jwt_auth import JWTCookieAuthentication
from dj_rest_auth.registration.views import RegisterView, SocialLoginView
from django.conf import settings
from django.utils.translation import gettext as _
from requests.exceptions import RequestException
from rest_framework import generics, permissions, status, viewsets
from rest_framework.authentication import (
    BasicAuthentication,
    SessionAuthentication,
    TokenAuthentication,
)
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import (
    UserDetailSerializer,
    UserModifySerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == "retrieve" or self.action == "list":
            return UserSerializer
        if self.action == "update":
            return UserUpdateSerializer
        return UserModifySerializer

    def perform_update(self, serializer):
        serializer.save(request=self.request)


class CustomRegisterView(RegisterView):

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            {"message": "Registered successfully"},
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class UserProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    authentication_classes = [
        JWTCookieAuthentication,
        TokenAuthentication,
        SessionAuthentication,
        BasicAuthentication,
    ]

    def get(self, request):
        try:
            if not request.user.is_authenticated:
                return Response(
                    {"detail": "Authentication credentials were not provided."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            user = request.user
            serializer = UserDetailSerializer(user)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"detail": f"Error accessing profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def patch(self, request):
        try:
            if not request.user.is_authenticated:
                return Response(
                    {"detail": "Authentication credentials were not provided."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            user = request.user
            serializer = UserProfileUpdateSerializer(
                user, data=request.data, partial=True
            )

            if serializer.is_valid():
                serializer.save()
                detail_serializer = UserDetailSerializer(user)
                return Response(
                    {
                        "message": "Your profile information has been updated successfully",
                        "user": detail_serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": f"Error updating profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
