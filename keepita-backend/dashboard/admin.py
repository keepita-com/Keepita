from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from . import models

@admin.register(models.Backup)
class BackupAdmin(admin.ModelAdmin):
    list_display = ('name', 'model_name', 'password', 'user', 'created_at')
    list_filter = ('model_name', 'user', 'created_at')
    search_fields = ('name', 'model_name', 'password', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

@admin.register(models.Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone_number', 'is_favorite', 'backup', 'date_of_birth')
    list_filter = ('is_favorite', 'backup', 'date_of_birth')
    search_fields = ('name', 'phone_number')
    list_editable = ('is_favorite',)

@admin.register(models.ChatThread)
class ChatThreadAdmin(admin.ModelAdmin):
    list_display = ('address', 'contact', 'backup', 'created_at', 'messages_count')
    list_filter = ('backup', 'created_at')
    search_fields = ('address', 'contact__name')

    def messages_count(self, obj):
        return obj.messages.count()
    messages_count.short_description = 'Messages'

@admin.register(models.Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('chat_thread', 'date', 'status', 'seen', 'sim_slot')
    list_filter = ('status', 'seen', 'date', 'sim_slot')
    search_fields = ('body', 'chat_thread__address')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(models.CallLog)
class CallLogAdmin(admin.ModelAdmin):
    list_display = ('number', 'name', 'contact', 'type', 'duration_display', 'date')
    list_filter = ('type', 'date')
    search_fields = ('number', 'name', 'contact__name')

    def duration_display(self, obj):
        minutes = obj.duration // 60
        seconds = obj.duration % 60
        return f"{minutes}:{seconds:02d}"
    duration_display.short_description = 'Duration'

@admin.register(models.ApkList)
class ApkListAdmin(admin.ModelAdmin):
    list_display = ('apk_name', 'version_name', 'size_display', 'last_time_used', 'recent_used')
    list_filter = ('recent_used', 'last_time_used')
    search_fields = ('apk_name', 'version_name')

    def size_display(self, obj):
        return f"{obj.size / (1024 * 1024):.1f} MB"
    size_display.short_description = 'Size (MB)'

@admin.register(models.ApkPermission)
class ApkPermissionAdmin(admin.ModelAdmin):
    list_display = ('permission_name', 'permission_group', 'apk', 'status', 'protection_level')
    list_filter = ('permission_group', 'status', 'protection_level')
    search_fields = ('permission_name', 'permission_group', 'apk__apk_name')

@admin.register(models.Alarm)
class AlarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'time', 'active', 'repeat_type', 'backup')
    list_filter = ('active', 'time')
    search_fields = ('name',)
    list_editable = ('active',)

@admin.register(models.WorldClock)
class WorldClockAdmin(admin.ModelAdmin):
    list_display = ('city_name', 'timezone', 'clock_id', 'backup')
    list_filter = ('timezone',)
    search_fields = ('city_name', 'timezone')

@admin.register(models.AlarmSettings)
class AlarmSettingsAdmin(admin.ModelAdmin):
    list_display = ('backup', 'weather_enabled', 'timer_sound', 'timer_vibration', 'show_mini_timer')
    list_filter = ('weather_enabled', 'timer_sound', 'timer_vibration', 'show_mini_timer')

@admin.register(models.HomeScreenLayout)
class HomeScreenLayoutAdmin(admin.ModelAdmin):
    list_display = ('backup', 'rows', 'columns', 'page_count', 'layout_status')
    list_filter = ('has_zero_page', 'is_portrait_only', 'notification_panel_enabled', 'layout_locked')
    search_fields = ('backup__name',)

    def layout_status(self, obj):
        status = []
        if obj.layout_locked:
            status.append('🔒 Locked')
        if obj.notification_panel_enabled:
            status.append('🔔 Notifications')
        if obj.badge_enabled:
            status.append('📛 Badges')
        return ' | '.join(status) if status else '-'
    layout_status.short_description = 'Status'

@admin.register(models.HomeScreenFolder)
class HomeScreenFolderAdmin(admin.ModelAdmin):
    list_display = ('title', 'screen_index', 'position', 'layout', 'items_count')
    list_filter = ('screen_index', 'layout')
    search_fields = ('title',)

    def position(self, obj):
        return f"({obj.x}, {obj.y})"
    position.short_description = 'Position'

    def items_count(self, obj):
        return obj.items.count()
    items_count.short_description = 'Items'

@admin.register(models.HomeScreenItem)
class HomeScreenItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'item_type', 'location', 'position', 'folder', 'is_hidden')
    list_filter = ('item_type', 'location', 'is_hidden', 'screen_index')
    search_fields = ('title', 'package_name')
    
    def position(self, obj):
        return f"({obj.x}, {obj.y})"
    position.short_description = 'Position'

@admin.register(models.BrowserBookmark)
class BrowserBookmarkAdmin(admin.ModelAdmin):
    list_display = ('title', 'url_display', 'backup', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'url')
    readonly_fields = ('created_at', 'updated_at')

    def url_display(self, obj):
        return format_html('<a href="{}" target="_blank">{}</a>', obj.url, obj.url[:50] + '...' if len(obj.url) > 50 else obj.url)
    url_display.short_description = 'URL'

@admin.register(models.BrowserHistory)
class BrowserHistoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'url_display', 'visit_count', 'typed_count', 'last_visit_time', 'hidden')
    list_filter = ('hidden', 'last_visit_time', 'source')
    search_fields = ('title', 'url')

    def url_display(self, obj):
        return format_html('<a href="{}" target="_blank">{}</a>', obj.url, obj.url[:50] + '...' if len(obj.url) > 50 else obj.url)
    url_display.short_description = 'URL'

@admin.register(models.BrowserDownload)
class BrowserDownloadAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'size_display', 'state', 'download_time')
    list_filter = ('state', 'download_time')
    search_fields = ('file_name', 'url')
    date_hierarchy = 'download_time'

    def size_display(self, obj):
        return f"{obj.bytes_downloaded / (1024 * 1024):.1f} MB"
    size_display.short_description = 'Size'

@admin.register(models.BrowserSearch)
class BrowserSearchAdmin(admin.ModelAdmin):
    list_display = ('search_term', 'search_engine', 'search_time', 'backup')
    list_filter = ('search_engine', 'search_time')
    search_fields = ('search_term', 'search_engine')

@admin.register(models.BrowserTab)
class BrowserTabAdmin(admin.ModelAdmin):
    list_display = ('title', 'url_display', 'last_accessed', 'tab_status')
    list_filter = ('is_incognito', 'is_pinned', 'last_accessed')
    search_fields = ('title', 'url')

    def url_display(self, obj):
        return format_html('<a href="{}" target="_blank">{}</a>', obj.url, obj.url[:50] + '...' if len(obj.url) > 50 else obj.url)
    url_display.short_description = 'URL'

    def tab_status(self, obj):
        status = []
        if obj.is_pinned:
            status.append('📌 Pinned')
        if obj.is_incognito:
            status.append('🕶️ Incognito')
        return ' | '.join(status) if status else '-'
    tab_status.short_description = 'Status'

@admin.register(models.Wallpaper)
class WallpaperAdmin(admin.ModelAdmin):
    list_display = ('type', 'is_default', 'backup', 'original_path', 'image')
    list_filter = ('type', 'is_default')
    search_fields = ('original_path',)
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" style="max-height: 100px; max-width: 100px;" />'
        return "No image"
    image_preview.allow_tags = True
    image_preview.short_description = "Image Preview"

@admin.register(models.File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'category', 'mime_type', 'size_display', 'modified_date')
    list_filter = ('category', 'mime_type', 'is_hidden')
    search_fields = ('file_name', 'file_path', 'owner_package')
    
    def size_display(self, obj):
        if not obj.file_size:
            return "Unknown"
        if obj.file_size < 1024 * 1024:  
            return f"{obj.file_size / 1024:.1f} KB"
        elif obj.file_size < 1024 * 1024 * 1024:  
            return f"{obj.file_size / (1024 * 1024):.1f} MB"
        else:
            return f"{obj.file_size / (1024 * 1024 * 1024):.1f} GB"
    size_display.short_description = 'Size'

@admin.register(models.Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ('email_address', 'account_name', 'account_type', 'is_primary', 'is_verified')
    list_filter = ('account_type', 'is_primary', 'is_verified')
    search_fields = ('email_address', 'account_name')
    list_editable = ('is_primary',)

@admin.register(models.BluetoothDevice)
class BluetoothDeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'device_class', 'last_connected', 'bond_state')
    list_filter = ('device_class', 'bond_state')
    search_fields = ('name', 'address')
    readonly_fields = ('last_connected',)
    
@admin.register(models.WifiNetwork)
class WifiNetworkAdmin(admin.ModelAdmin):
    list_display = ('ssid', 'security_type', 'password', 'hidden', 'frequency')
    list_filter = ('security_type', 'hidden', 'frequency')
    search_fields = ('ssid',)
    readonly_fields = ('last_connected',)
    
@admin.register(models.BackupLog)
class BackupLogAdmin(admin.ModelAdmin):
    list_display = ('backup','created_at')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('created_at',)
    
    def timestamp(self, obj):
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    timestamp.short_description = 'Timestamp'

admin.site.register(models.Notification)
admin.site.register(models.DecryptedFile)
admin.site.register(models.ClientInstance)

@admin.register(models.AsyncTask)
class AsyncTaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'client')
    readonly_fields = ('id', 'created_at', 'updated_at', 'result_data')

@admin.register(models.Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('backup', 'title', 'body_snippet', 'created_at')
    list_filter = ('backup', 'created_at')
    search_fields = ('title', 'body', 'note_id') 
    readonly_fields = ('created_at',)

    def body_snippet(self, obj):
        if not obj.body:
            return "[No Body]"
        return obj.body[:100] + '...' if len(obj.body) > 100 else obj.body
    body_snippet.short_description = 'Body'

@admin.register(models.BackupMetadata)
class BackupMetadataAdmin(admin.ModelAdmin):
    list_display = (
        'backup', 
        'device_name', 
        'miui_version', 
        'backup_date', 
        'formatted_backup_size', 
        'formatted_storage_left'
    )
    list_filter = ('device_name', 'miui_version', 'backup_date')
    search_fields = ('backup__name', 'device_name', 'miui_version')
    list_select_related = ('backup',) 

    def format_size(self, size_in_bytes):
        if size_in_bytes is None:
            return "N/A"
        if size_in_bytes < 1024**2:
            return f"{size_in_bytes / 1024:.1f} KB"
        if size_in_bytes < 1024**3:
            return f"{size_in_bytes / (1024**2):.1f} MB"
        return f"{size_in_bytes / (1024**3):.1f} GB"

    def formatted_backup_size(self, obj):
        return self.format_size(obj.backup_size)
    formatted_backup_size.short_description = 'Declared Size'
    formatted_backup_size.admin_order_field = 'backup_size'

    def formatted_storage_left(self, obj):
        return self.format_size(obj.storage_left)
    formatted_storage_left.short_description = 'Storage Left'
    formatted_storage_left.admin_order_field = 'storage_left'

@admin.register(models.CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = (
        'summary',
        'start_date',
        'end_date',
        'location_display', 
        'backup_link', 
    )
    
    list_filter = (
        'start_date', 
        'backup__name', 
    )

    search_fields = (
        'summary',
        'location',
        'backup__name', 
    )
    
    date_hierarchy = 'start_date'

    list_select_related = ('backup',)
    
    def location_display(self, obj):
        return obj.location if obj.location else "— No Location —"
    location_display.short_description = 'Location'
    
    def backup_link(self, obj):
 
        from django.urls import reverse
        
        if obj.backup:
            link = reverse("admin:dashboard_backup_change", args=[obj.backup.id])
            return format_html('<a href="{}">{}</a>', link, obj.backup.name)
        return "No Backup"
    backup_link.short_description = 'Backup'

class IOSWidgetItemInline(admin.TabularInline):

    model = models.IOSWidgetItem
    extra = 0
    fields = ('position_in_stack', 'bundle_identifier', 'widget_kind')
    readonly_fields = fields
    can_delete = False
    ordering = ('position_in_stack',)
    verbose_name = 'Widget in Stack'
    verbose_name_plural = 'Widgets in Stack'

@admin.register(models.IOSHomeScreenLayout)
class IOSHomeScreenLayoutAdmin(admin.ModelAdmin):

    list_display = ('id', 'backup_link', 'widget_version', 'total_items_count', 'created_at')
    list_filter = ('backup__name',)
    search_fields = ('backup__name',)
    list_select_related = ('backup',)
    readonly_fields = ('created_at',)

    def total_items_count(self, obj):
        return obj.items.count()
    total_items_count.short_description = 'Total Items'

    def backup_link(self, obj):
        if obj.backup:
            link = reverse("admin:dashboard_backup_change", args=[obj.backup.id])
            return format_html('<a href="{}">{}</a>', link, obj.backup)
        return "-"
    backup_link.short_description = 'Backup'

@admin.register(models.IOSHomeScreenItem)
class IOSHomeScreenItemAdmin(admin.ModelAdmin):

    list_display = ('item_identifier', 'item_type', 'location', 'page_index', 'position', 'parent_folder_link')
    search_fields = ('bundle_identifier', 'display_name', 'title')
    list_filter = ('item_type', 'location', 'page_index', 'layout__backup__name')
    list_select_related = ('parent_folder', 'layout__backup')
    inlines = [IOSWidgetItemInline]

    @admin.display(description='Identifier', ordering='title') 
    def item_identifier(self, obj):
        if obj.item_type == 'APP':
            return obj.title
        elif obj.item_type == 'FOLDER':
            return format_html('<b>{}</b>', obj.display_name or "Unnamed Folder")

    def get_inlines(self, request, obj=None):
        if obj and obj.item_type == 'WIDGET_STACK':
            return super().get_inlines(request, obj)
        return []

    @admin.display(description='Identifier', ordering='bundle_identifier')
    def item_identifier(self, obj):
        if obj.item_type == 'APP':
            return obj.bundle_identifier
        elif obj.item_type == 'FOLDER':
            return format_html('<b>{}</b>', obj.display_name or "Unnamed Folder")
        elif obj.item_type == 'WIDGET_STACK':
            return f"Widget Stack ({obj.grid_size})"
        return "Unknown Item"

    @admin.display(description='Position (X,Y) & Span')
    def position(self, obj):

        return f"({obj.x}, {obj.y}) span ({obj.span_x}x{obj.span_y})"

    @admin.display(description='Parent Folder')
    def parent_folder_link(self, obj):

        if obj.parent_folder:
            link = reverse("admin:dashboard_ioshomescreenitem_change", args=[obj.parent_folder.id])
            return format_html('<a href="{}">{}</a>', link, obj.parent_folder.display_name or f"Folder ID: {obj.parent_folder.id}")
        return "—"

@admin.register(models.IOSNotification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = (
        'app_name',
        'title',
        'body_snippet', 
        'timestamp',
        'backup_link',
    )
    list_filter = (
        'app_name',
        'timestamp',
        'backup__name',  
    )

    search_fields = (
        'app_name',
        'title',
        'body',
        'backup__name',
    )
    
    date_hierarchy = 'timestamp'
    
    list_select_related = ('backup',)
    
    readonly_fields = ('app_name', 'timestamp', 'title', 'body', 'backup')

    def has_add_permission(self, request):

        return False
        
    def has_change_permission(self, request, obj=None):

        return False
        
    def body_snippet(self, obj):

        if obj.body:
            return obj.body[:100] + '...' if len(obj.body) > 100 else obj.body
        return "— No Content —"
    body_snippet.short_description = 'Body Snippet'

    def backup_link(self, obj):
        if obj.backup:
            link = reverse("admin:dashboard_backup_change", args=[obj.backup.id])
            return format_html('<a href="{}">{}</a>', link, obj.backup.name)
        return "N/A"
    backup_link.short_description = 'Backup'

@admin.register(models.Reminder)
class ReminderAdmin(admin.ModelAdmin):

    list_display = (
        'title', 
        'list_name', 
        'due_date', 
        'is_completed', 
        'priority',
        'backup'  
    )
    list_filter = (
        'is_completed', 
        'priority', 
        'list_name', 
        'backup__name'  
    )
    search_fields = (
        'title', 
        'notes', 
        'list_name'
    )
    readonly_fields = (
        'backup', 
        'list_name', 
        'title', 
        'notes', 
        'is_completed', 
        'completion_date', 
        'creation_date', 
        'due_date', 
        'priority', 
        'created_at'
    )
    ordering = ('-creation_date',)
    list_per_page = 25

    def has_add_permission(self, request):
        return False
        
    def has_change_permission(self, request, obj=None):
        return False
