from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken, SlidingToken, UntypedToken

from .models import User

if api_settings.BLACKLIST_AFTER_ROTATION:
    from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from dj_rest_auth.registration.serializers import RegisterSerializer

from .validators import profile_picture_validator, username_validator

try:
    from allauth.account import app_settings as allauth_account_settings
    from allauth.account.adapter import get_adapter
    from allauth.account.models import EmailAddress
    from allauth.utils import get_username_max_length
except ImportError:
    raise ImportError("allauth needs to be added to INSTALLED_APPS.")


class CustomRegisterSerializer(RegisterSerializer):
    username = serializers.CharField(
        max_length=get_username_max_length(),
        min_length=allauth_account_settings.USERNAME_MIN_LENGTH,
        required=allauth_account_settings.USERNAME_REQUIRED,
        validators=[username_validator],
    )
    email = serializers.EmailField(
        required=allauth_account_settings.EMAIL_REQUIRED,
        validators=[UniqueValidator(queryset=get_user_model().objects.all())],
    )
    last_name = serializers.CharField(max_length=50, required=False)
    first_name = serializers.CharField(max_length=50, required=False)
    profile_image = serializers.ImageField(
        required=False, validators=[profile_picture_validator]
    )

    def get_cleaned_data(self):
        super_data = super().get_cleaned_data()
        return {
            "username": super_data.get("username", ""),
            "email": super_data.get("email", ""),
            "password1": super_data.get("password1", ""),
            "first_name": self.validated_data.get("first_name", ""),
            "last_name": self.validated_data.get("last_name", ""),
            "profile_image": self.validated_data.get("profile_image", ""),
        }

    def save(self, request):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        user = adapter.save_user(request, user, self, commit=False)

        user.first_name = self.cleaned_data.get("first_name")
        user.last_name = self.cleaned_data.get("last_name")
        user.profile_image = self.cleaned_data.get("profile_image")
        user.save()
        return user

    def to_representation(self, instance):
        return {"message": "Registered successfully", "status": True}


class TokenVerifySerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate(self, attrs):
        token = UntypedToken(attrs["token"])

        if (
            api_settings.BLACKLIST_AFTER_ROTATION
            and "rest_framework_simplejwt.token_blacklist" in settings.INSTALLED_APPS
        ):
            jti = token.get(api_settings.JTI_CLAIM)
            if BlacklistedToken.objects.filter(token__jti=jti).exists():
                raise ValidationError("Token is blacklisted")

        return {"detail": "ok"}


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ["password", "groups", "user_permissions"]


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ["password", "groups", "user_permissions"]
        read_only_fields = ["is_superuser", "is_staff", "email_verified", "is_active"]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=False, validators=[UniqueValidator(queryset=User.objects.all())]
    )
    profile_image = serializers.ImageField(
        required=False, validators=[profile_picture_validator]
    )

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "profile_image"]

    def update(self, instance, validated_data):
        if "email" in validated_data and validated_data["email"] != instance.email:
            instance.email = validated_data.pop("email")

            try:
                from allauth.account.models import EmailAddress

                if EmailAddress.objects.filter(user=instance).exists():
                    email_address = EmailAddress.objects.get(user=instance)
                    email_address.email = instance.email
                    email_address.save()
            except ImportError:
                pass

        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        print(validated_data.get("profile_image"))

        if "profile_image" in validated_data:
            instance.profile_image = validated_data.get("profile_image")
            print(validated_data.get("profile_image"))

            from django.core.files.base import ContentFile

            print(validated_data.get("profile_image"))
            image = validated_data.get("profile_image")
            if image:
                print("saveing image")
                instance.profile_image.save(image.name, image, save=False)
                print("saved image")

        instance.save()
        return instance


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ["password", "groups", "user_permissions"]


class UserModifySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ["groups", "user_permissions"]

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        user = super(UserModifySerializer, self).create(validated_data)
        EmailAddress.objects.create(
            user=user, email=user.email, primary=True, verified=True
        )
        return user

    def update(self, instance, validated_data):
        if (
            "password" in validated_data
            and validated_data["password"] != instance.password
        ):
            validated_data["password"] = make_password(validated_data["password"])
        user = super(UserModifySerializer, self).update(instance, validated_data)
        email = user.email

        if email and EmailAddress.objects.filter(user=user).exists():
            email_address = EmailAddress.objects.get(user=user)
            email_address.email = user.email
            email_address.save()
        elif email and not EmailAddress.objects.filter(user=user).exists():
            EmailAddress.objects.create(
                user=user, email=user.email, primary=True, verified=True
            )

        return user


class UserIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class UsernameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username"]
