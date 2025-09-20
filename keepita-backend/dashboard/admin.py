from django.contrib import admin
from django.utils.html import format_html

from . import models


@admin.register(models.Backup)
class BackupAdmin(admin.ModelAdmin):
    list_display = ("name", "model_name", "pin", "user", "created_at")
    list_filter = ("model_name", "user", "created_at")
    search_fields = ("name", "model_name", "pin", "user__username")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(models.Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("name", "phone_number", "is_favorite", "backup", "date_of_birth")
    list_filter = ("is_favorite", "backup", "date_of_birth")
    search_fields = ("name", "phone_number")
    list_editable = ("is_favorite",)


@admin.register(models.ChatThread)
class ChatThreadAdmin(admin.ModelAdmin):
    list_display = ("address", "contact", "backup", "created_at", "messages_count")
    list_filter = ("backup", "created_at")
    search_fields = ("address", "contact__name")

    def messages_count(self, obj):
        return obj.messages.count()

    messages_count.short_description = "Messages"


@admin.register(models.Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("chat_thread", "date", "status", "seen", "sim_slot")
    list_filter = ("status", "seen", "date", "sim_slot")
    search_fields = ("body", "chat_thread__address")
    readonly_fields = ("created_at", "updated_at")


@admin.register(models.CallLog)
class CallLogAdmin(admin.ModelAdmin):
    list_display = ("number", "name", "contact", "type", "duration_display", "date")
    list_filter = ("type", "date")
    search_fields = ("number", "name", "contact__name")

    def duration_display(self, obj):
        minutes = obj.duration // 60
        seconds = obj.duration % 60
        return f"{minutes}:{seconds:02d}"

    duration_display.short_description = "Duration"


@admin.register(models.ApkList)
class ApkListAdmin(admin.ModelAdmin):
    list_display = (
        "apk_name",
        "version_name",
        "size_display",
        "last_time_used",
        "recent_used",
    )
    list_filter = ("recent_used", "last_time_used")
    search_fields = ("apk_name", "version_name")

    def size_display(self, obj):
        return f"{obj.size / (1024 * 1024):.1f} MB"

    size_display.short_description = "Size (MB)"


@admin.register(models.ApkPermission)
class ApkPermissionAdmin(admin.ModelAdmin):
    list_display = (
        "permission_name",
        "permission_group",
        "apk",
        "status",
        "protection_level",
    )
    list_filter = ("permission_group", "status", "protection_level")
    search_fields = ("permission_name", "permission_group", "apk__apk_name")


@admin.register(models.Alarm)
class AlarmAdmin(admin.ModelAdmin):
    list_display = ("name", "time", "active", "repeat_type", "backup")
    list_filter = ("active", "time")
    search_fields = ("name",)
    list_editable = ("active",)


@admin.register(models.WorldClock)
class WorldClockAdmin(admin.ModelAdmin):
    list_display = ("city_name", "timezone", "clock_id", "backup")
    list_filter = ("timezone",)
    search_fields = ("city_name", "timezone")


@admin.register(models.AlarmSettings)
class AlarmSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "backup",
        "weather_enabled",
        "timer_sound",
        "timer_vibration",
        "show_mini_timer",
    )
    list_filter = (
        "weather_enabled",
        "timer_sound",
        "timer_vibration",
        "show_mini_timer",
    )


@admin.register(models.HomeScreenLayout)
class HomeScreenLayoutAdmin(admin.ModelAdmin):
    list_display = ("backup", "rows", "columns", "page_count", "layout_status")
    list_filter = (
        "has_zero_page",
        "is_portrait_only",
        "notification_panel_enabled",
        "layout_locked",
    )
    search_fields = ("backup__name",)

    def layout_status(self, obj):
        status = []
        if obj.layout_locked:
            status.append("🔒 Locked")
        if obj.notification_panel_enabled:
            status.append("🔔 Notifications")
        if obj.badge_enabled:
            status.append("📛 Badges")
        return " | ".join(status) if status else "-"

    layout_status.short_description = "Status"


@admin.register(models.HomeScreenFolder)
class HomeScreenFolderAdmin(admin.ModelAdmin):
    list_display = ("title", "screen_index", "position", "layout", "items_count")
    list_filter = ("screen_index", "layout")
    search_fields = ("title",)

    def position(self, obj):
        return f"({obj.x}, {obj.y})"

    position.short_description = "Position"

    def items_count(self, obj):
        return obj.items.count()

    items_count.short_description = "Items"


@admin.register(models.HomeScreenItem)
class HomeScreenItemAdmin(admin.ModelAdmin):
    list_display = ("title", "item_type", "location", "position", "folder", "is_hidden")
    list_filter = ("item_type", "location", "is_hidden", "screen_index")
    search_fields = ("title", "package_name")

    def position(self, obj):
        return f"({obj.x}, {obj.y})"

    position.short_description = "Position"


@admin.register(models.BrowserBookmark)
class BrowserBookmarkAdmin(admin.ModelAdmin):
    list_display = ("title", "url_display", "backup", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "url")
    readonly_fields = ("created_at", "updated_at")

    def url_display(self, obj):
        return format_html(
            '<a href="{}" target="_blank">{}</a>',
            obj.url,
            obj.url[:50] + "..." if len(obj.url) > 50 else obj.url,
        )

    url_display.short_description = "URL"


@admin.register(models.BrowserHistory)
class BrowserHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "url_display",
        "visit_count",
        "typed_count",
        "last_visit_time",
        "hidden",
    )
    list_filter = ("hidden", "last_visit_time", "source")
    search_fields = ("title", "url")

    def url_display(self, obj):
        return format_html(
            '<a href="{}" target="_blank">{}</a>',
            obj.url,
            obj.url[:50] + "..." if len(obj.url) > 50 else obj.url,
        )

    url_display.short_description = "URL"


@admin.register(models.BrowserDownload)
class BrowserDownloadAdmin(admin.ModelAdmin):
    list_display = ("file_name", "size_display", "state", "download_time")
    list_filter = ("state", "download_time")
    search_fields = ("file_name", "url")
    date_hierarchy = "download_time"

    def size_display(self, obj):
        return f"{obj.bytes_downloaded / (1024 * 1024):.1f} MB"

    size_display.short_description = "Size"


@admin.register(models.BrowserSearch)
class BrowserSearchAdmin(admin.ModelAdmin):
    list_display = ("search_term", "search_engine", "search_time", "backup")
    list_filter = ("search_engine", "search_time")
    search_fields = ("search_term", "search_engine")


@admin.register(models.BrowserTab)
class BrowserTabAdmin(admin.ModelAdmin):
    list_display = ("title", "url_display", "last_accessed", "tab_status")
    list_filter = ("is_incognito", "is_pinned", "last_accessed")
    search_fields = ("title", "url")

    def url_display(self, obj):
        return format_html(
            '<a href="{}" target="_blank">{}</a>',
            obj.url,
            obj.url[:50] + "..." if len(obj.url) > 50 else obj.url,
        )

    url_display.short_description = "URL"

    def tab_status(self, obj):
        status = []
        if obj.is_pinned:
            status.append("📌 Pinned")
        if obj.is_incognito:
            status.append("🕶️ Incognito")
        return " | ".join(status) if status else "-"

    tab_status.short_description = "Status"


@admin.register(models.Wallpaper)
class WallpaperAdmin(admin.ModelAdmin):
    list_display = ("type", "is_default", "backup", "original_path", "image")
    list_filter = ("type", "is_default")
    search_fields = ("original_path",)
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" style="max-height: 100px; max-width: 100px;" />'
        return "No image"

    image_preview.allow_tags = True
    image_preview.short_description = "Image Preview"


@admin.register(models.File)
class FileAdmin(admin.ModelAdmin):
    list_display = (
        "file_name",
        "category",
        "mime_type",
        "size_display",
        "modified_date",
    )
    list_filter = ("category", "mime_type", "is_hidden")
    search_fields = ("file_name", "file_path", "owner_package")

    def size_display(self, obj):
        if not obj.file_size:
            return "Unknown"
        if obj.file_size < 1024 * 1024:
            return f"{obj.file_size / 1024:.1f} KB"
        elif obj.file_size < 1024 * 1024 * 1024:
            return f"{obj.file_size / (1024 * 1024):.1f} MB"
        else:
            return f"{obj.file_size / (1024 * 1024 * 1024):.1f} GB"

    size_display.short_description = "Size"


@admin.register(models.Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = (
        "email_address",
        "account_name",
        "account_type",
        "is_primary",
        "is_verified",
    )
    list_filter = ("account_type", "is_primary", "is_verified")
    search_fields = ("email_address", "account_name")
    list_editable = ("is_primary",)


@admin.register(models.BluetoothDevice)
class BluetoothDeviceAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "device_class", "last_connected", "bond_state")
    list_filter = ("device_class", "bond_state")
    search_fields = ("name", "address")
    readonly_fields = ("last_connected",)


@admin.register(models.WifiNetwork)
class WifiNetworkAdmin(admin.ModelAdmin):
    list_display = ("ssid", "security_type", "password", "hidden", "frequency")
    list_filter = ("security_type", "hidden", "frequency")
    search_fields = ("ssid",)
    readonly_fields = ("last_connected",)


@admin.register(models.BackupLog)
class BackupLogAdmin(admin.ModelAdmin):
    list_display = ("backup", "created_at")
    list_filter = ("created_at", "updated_at")
    readonly_fields = ("created_at",)

    def timestamp(self, obj):
        return obj.timestamp.strftime("%Y-%m-%d %H:%M:%S")

    timestamp.short_description = "Timestamp"