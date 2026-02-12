from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin 

class CustomUserAdmin(UserAdmin):

    fieldsets = UserAdmin.fieldsets + (
        ('more_info', {
            'fields': ('profile_image', 'email_verified'),
        }),
    )

    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'email_verified')
    
    list_filter = UserAdmin.list_filter + ('email_verified',)

admin.site.register(User , CustomUserAdmin)