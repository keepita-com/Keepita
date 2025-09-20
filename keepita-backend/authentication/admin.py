from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User

CustomeUserAdmin = UserAdmin
CustomeUserAdmin.fieldsets[1][1]["fields"] = (
    "first_name",
    "last_name",
    "email",
    "profile_image",
)

admin.site.register(User, CustomeUserAdmin)
