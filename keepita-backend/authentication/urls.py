from django.urls import path, include
from . import views
from dj_rest_auth.app_settings import api_settings

from dj_rest_auth.views import (
    LoginView, LogoutView, PasswordChangeView, PasswordResetConfirmView,
    PasswordResetView, UserDetailsView,
)

from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CustomRegisterView, UserProfileUpdateView
from dj_rest_auth.registration.views import SocialLoginView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='rest_login'),
    path('auth/logout/', LogoutView.as_view(), name='rest_logout'),
    path('user/profile/', UserProfileUpdateView.as_view(), name='user_profile_update'),
    path('', include(router.urls)),
    path('auth/registration/', CustomRegisterView.as_view(), name='rest_register'),
    path('auth/', include('dj_rest_auth.urls')),
]

if api_settings.USE_JWT:
    from rest_framework_simplejwt.views import TokenVerifyView

    from dj_rest_auth.jwt_auth import get_refresh_view

    urlpatterns += [
        path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
        path('token/refresh/', get_refresh_view().as_view(), name='token_refresh'),
    ]
