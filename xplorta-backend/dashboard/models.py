import uuid
from functools import partial

from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

User = get_user_model()


def backup_file_path(instance, filename):
    return f"backups/{instance.user.id}/{filename}"


def get_backup_relative_upload_path(instance, filename, subfolder):
    backup = instance.backup
    return f"Users Backups/{backup.user.username}/{backup.name} {backup.id}/{subfolder}/{filename}"


class Backup(models.Model):
    STATUS_CHOICES = [
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    name = models.CharField(_("Name"), max_length=255)
    model_name = models.CharField(_("Model Name"), max_length=255)
    pin = models.IntegerField(_("PIN"), null=True, blank=True)
    size = models.BigIntegerField(_("Size"))
    file = models.FileField(_("Backup File"), upload_to=backup_file_path)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="backups")
    status = models.CharField(
        _("Status"), max_length=20, choices=STATUS_CHOICES, default="processing"
    )
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Backup")
        verbose_name_plural = _("Backups")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.model_name}"


class BackupLog(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    backup = models.ForeignKey(Backup, on_delete=models.CASCADE, related_name="logs")
    current_step = models.IntegerField(_("Current Step"), default=0)
    total_steps = models.IntegerField(_("Total Steps"), default=0)
    progress_percentage = models.FloatField(_("Progress Percentage"), default=0.0)
    status = models.CharField(
        _("Status"), max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    steps_data = models.JSONField(_("Steps Data"), default=dict)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Backup Log")
        verbose_name_plural = _("Backup Logs")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Log {self.id} - {self.backup.name if self.backup else 'No backup'}"

    def update_step(
        self, step_number, name, description, progress_percent=0, status="processing"
    ):
        self.current_step = step_number
        step_key = f"step_{step_number}"

        if not self.steps_data:
            self.steps_data = {}

        if step_key in self.steps_data:
            current_step = self.steps_data[step_key]

            if current_step.get("status") == "completed" and status != "failed":
                return self

            if (
                status == "failed"
                or progress_percent > current_step.get("progress_percent", 0)
                or status == "completed"
            ):
                current_step["progress_percent"] = (
                    0
                    if status == "failed"
                    else (100 if status == "completed" else progress_percent)
                )
                current_step["description"] = description
                current_step["status"] = status
                current_step["timestamp"] = timezone.now().isoformat()
        else:
            self.steps_data[step_key] = {
                "name": name,
                "description": description,
                "progress_percent": progress_percent,
                "status": status,
                "timestamp": timezone.now().isoformat(),
            }

            if step_number > 1:
                for prev_step in range(1, step_number):
                    prev_key = f"step_{prev_step}"
                    if (
                        prev_key in self.steps_data
                        and self.steps_data[prev_key].get("status") == "processing"
                    ):
                        self.steps_data[prev_key]["status"] = "completed"
                        self.steps_data[prev_key]["progress_percent"] = 100
        completed_steps = 0
        current_step_contribution = 0

        for step_idx in range(1, self.total_steps + 1):
            step_data = self.steps_data.get(f"step_{step_idx}")
            if not step_data:
                continue

            if step_data.get("status") == "completed":
                completed_steps += 1
            elif (
                step_idx == step_number
                and step_data.get("status") == "processing"
                and progress_percent > 0
            ):
                current_step_contribution = (progress_percent / 100) * (
                    1 / self.total_steps
                )

        if self.total_steps > 0:
            base_progress = (completed_steps / self.total_steps) * 100

            total_progress = base_progress + current_step_contribution * 100
            self.progress_percentage = min(total_progress, 100)

        self.save(
            update_fields=[
                "current_step",
                "steps_data",
                "progress_percentage",
                "updated_at",
            ]
        )
        return self

    def initialize_steps(self, steps_list):
        self.total_steps = len(steps_list)
        self.steps_data = {
            f"step_{i+1}": {
                "name": step["name"],
                "description": step["description"],
                "progress_percent": 0,
                "status": "pending",
                "timestamp": timezone.now().isoformat(),
            }
            for i, step in enumerate(steps_list)
        }
        self.save()
        return self

    def mark_complete(self):
        self.status = "completed"
        self.progress_percentage = 100

        if self.backup:
            self.backup.status = "completed"
            self.backup.save(update_fields=["status"])

        self.save()
        return self

    def mark_failed(self, error_message):
        self.status = "failed"

        self.steps_data["error"] = {
            "message": error_message,
            "timestamp": timezone.now().isoformat(),
        }

        if self.backup:
            self.backup.status = "failed"
            self.backup.save(update_fields=["status"])

        self.save()
        return self


class Contact(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="contacts"
    )
    name = models.CharField(_("Name"), max_length=255)
    profile_image = models.ImageField(
        _("Profile Image"),
        upload_to=partial(get_backup_relative_upload_path, subfolder="contact_images"),
        null=True,
        blank=True,
    )
    phone_number = models.CharField(_("Phone Number"), max_length=255)
    date_of_birth = models.DateTimeField(_("Date of Birth"), null=True, blank=True)
    is_favorite = models.BooleanField(_("Is Favorite"), null=True, blank=True)

    class Meta:
        verbose_name = _("Contact")
        verbose_name_plural = _("Contacts")

    def __str__(self):
        return self.name


class ChatThread(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="chat_threads"
    )
    contact = models.ForeignKey(
        Contact, on_delete=models.SET_NULL, null=True, related_name="chat_threads"
    )
    address = models.CharField(_("Address"), max_length=255)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Chat Thread")
        verbose_name_plural = _("Chat Threads")

    def __str__(self):
        return f"Chat with {self.contact.name if self.contact else self.address}"


class Message(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="messages"
    )
    chat_thread = models.ForeignKey(
        ChatThread, on_delete=models.CASCADE, related_name="messages"
    )
    date = models.DateTimeField(_("Date"), null=True, blank=True)
    body = models.TextField(_("Body"), null=True, blank=True)
    status = models.IntegerField(_("Status"), null=True, blank=True)
    seen = models.BooleanField(_("Seen"), null=True, blank=True)
    sim_slot = models.IntegerField(_("SIM Slot"), null=True, blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Message")
        verbose_name_plural = _("Messages")
        ordering = ["date"]


class CallLog(models.Model):
    CALL_TYPES = [
        ("INCOMING", "Incoming"),
        ("OUTGOING", "Outgoing"),
        ("MISSED", "Missed"),
        ("REJECTED", "Rejected"),
    ]

    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="call_logs"
    )
    contact = models.ForeignKey(
        Contact, on_delete=models.SET_NULL, null=True, related_name="call_logs"
    )
    number = models.CharField(_("Number"), max_length=255)
    name = models.CharField(_("Name"), max_length=255, blank=True)
    date = models.DateTimeField(_("Date"))
    duration = models.IntegerField(_("Duration"))
    type = models.CharField(_("Type"), max_length=20, choices=CALL_TYPES)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Call Log")
        verbose_name_plural = _("Call Logs")
        ordering = ["-date"]


class ApkList(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="apk_lists"
    )
    apk_name = models.CharField(_("APK Name"), max_length=255)
    icon = models.ImageField(
        _("Icon"),
        upload_to=partial(get_backup_relative_upload_path, subfolder="app_icons"),
        null=True,
        blank=True,
    )
    version_name = models.CharField(
        _("Version Name"), max_length=100, null=True, blank=True
    )
    size = models.BigIntegerField(_("Size"), null=True, blank=True)
    last_time_used = models.DateTimeField(_("Last Time Used"), null=True, blank=True)
    recent_used = models.BooleanField(_("Recently Used"), default=False)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("APK List")
        verbose_name_plural = _("APK Lists")


class ApkPermission(models.Model):
    apk = models.ForeignKey(
        ApkList,
        on_delete=models.CASCADE,
        related_name="permissions",
        null=True,
        blank=True,
    )
    backup = models.ForeignKey(
        Backup,
        on_delete=models.CASCADE,
        related_name="apk_permissions",
        null=True,
        blank=True,
    )
    permission_name = models.CharField(
        _("Permission Name"), max_length=255, null=True, blank=True
    )
    permission_group = models.CharField(
        _("Permission Group"), max_length=255, null=True, blank=True
    )
    status = models.IntegerField(_("Status"), null=True, blank=True)
    flags = models.IntegerField(_("Flags"), null=True, blank=True)
    protection_level = models.IntegerField(_("Protection Level"), null=True, blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("APK Permission")
        verbose_name_plural = _("APK Permissions")


class Alarm(models.Model):
    backup = models.ForeignKey(Backup, on_delete=models.CASCADE, related_name="alarms")
    name = models.CharField(_("Name"), max_length=255, null=True, blank=True)
    time = models.TimeField(_("Time"), null=True, blank=True)
    active = models.BooleanField(_("Active"), default=False, null=True, blank=True)
    repeat_type = models.IntegerField(_("Repeat Type"), null=True, blank=True)
    created_at = models.DateTimeField(
        _("Created At"), auto_now_add=True, null=True, blank=True
    )

    class Meta:
        verbose_name = _("Alarm")
        verbose_name_plural = _("Alarms")


class WorldClock(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="world_clocks"
    )
    clock_id = models.IntegerField(_("Clock ID"))
    city_name = models.CharField(_("City Name"), max_length=255)
    timezone = models.CharField(_("Timezone"), max_length=100)
    dst_offset = models.IntegerField(_("DST Offset"))
    home_zone_id = models.IntegerField(_("Home Zone ID"))
    point_x = models.IntegerField(_("Point X"))
    point_y = models.IntegerField(_("Point Y"))
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("World Clock")
        verbose_name_plural = _("World Clocks")


class AlarmSettings(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="alarm_settings"
    )
    vibrate_alarm_timer = models.BooleanField(_("Vibrate Alarm Timer"), default=False)
    weather_enabled = models.BooleanField(_("Weather Enabled"), default=True)
    weather_unit = models.IntegerField(_("Weather Unit"))
    timer_sound = models.BooleanField(_("Timer Sound"), default=True)
    timer_vibration = models.BooleanField(_("Timer Vibration"), default=False)
    show_mini_timer = models.BooleanField(_("Show Mini Timer"), default=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Alarm Settings")
        verbose_name_plural = _("Alarm Settings")


class HomeScreenLayout(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="home_screen_layouts"
    )
    rows = models.IntegerField(_("Rows"))
    columns = models.IntegerField(_("Columns"))
    page_count = models.IntegerField(_("Page Count"))
    has_zero_page = models.BooleanField(_("Has Zero Page"))
    is_portrait_only = models.BooleanField(_("Is Portrait Only"))
    notification_panel_enabled = models.BooleanField(_("Notification Panel Enabled"))
    layout_locked = models.BooleanField(_("Layout Locked"))
    quick_access_enabled = models.BooleanField(_("Quick Access Enabled"))
    badge_enabled = models.BooleanField(_("Badge Enabled"))
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Home Screen Layout")
        verbose_name_plural = _("Home Screen Layouts")


class HomeScreenFolder(models.Model):
    layout = models.ForeignKey(
        HomeScreenLayout, on_delete=models.CASCADE, related_name="folders"
    )
    title = models.CharField(_("Title"), max_length=255, null=True, blank=True)
    screen_index = models.IntegerField(_("Screen Index"))
    x = models.IntegerField(_("X Position"))
    y = models.IntegerField(_("Y Position"))
    color = models.IntegerField(_("Color"))
    options = models.IntegerField(_("Options"))
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Home Screen Folder")
        verbose_name_plural = _("Home Screen Folders")


class HomeScreenItem(models.Model):
    ITEM_TYPES = [
        ("widget", "Widget"),
        ("app", "App"),
        ("folder", "Folder"),
    ]

    LOCATIONS = [
        ("home", "Home"),
        ("hotseat", "Hotseat"),
        ("homeOnly", "Home Only"),
    ]

    layout = models.ForeignKey(
        HomeScreenLayout, on_delete=models.CASCADE, related_name="items"
    )
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="home_screen_items"
    )
    folder = models.ForeignKey(
        HomeScreenFolder, on_delete=models.SET_NULL, null=True, related_name="items"
    )
    apk = models.ForeignKey(
        ApkList,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="home_screen_items",
    )
    item_type = models.CharField(_("Item Type"), max_length=50, choices=ITEM_TYPES)
    screen_index = models.IntegerField(_("Screen Index"))
    x = models.IntegerField(_("X Position"), default=0)
    y = models.IntegerField(_("Y Position"), default=0)
    span_x = models.IntegerField(_("Span X"), null=True)
    span_y = models.IntegerField(_("Span Y"), null=True)
    package_name = models.CharField(_("Package Name"), max_length=255, null=True)
    class_name = models.CharField(_("Class Name"), max_length=255, null=True)
    title = models.CharField(_("Title"), max_length=255, null=True)
    app_widget_id = models.IntegerField(_("App Widget ID"), null=True)
    is_hidden = models.BooleanField(_("Is Hidden"), default=False)
    location = models.CharField(_("Location"), max_length=50, choices=LOCATIONS)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Home Screen Item")
        verbose_name_plural = _("Home Screen Items")


class BrowserBookmark(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="browser_bookmarks"
    )
    title = models.CharField(_("Title"), max_length=255)
    url = models.URLField(_("URL"), max_length=2048)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Browser Bookmark")
        verbose_name_plural = _("Browser Bookmarks")


class BrowserHistory(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="browser_histories"
    )
    url = models.TextField(_("URL"))
    title = models.TextField(_("Title"), null=True, blank=True)
    visit_count = models.IntegerField(_("Visit Count"), default=0)
    typed_count = models.IntegerField(_("Typed Count"), default=0)
    last_visit_time = models.DateTimeField(_("Last Visit Time"))
    hidden = models.BooleanField(_("Hidden"), default=False)
    source = models.CharField(_("Source"), max_length=50)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Browser History")
        verbose_name_plural = _("Browser History")
        ordering = ["-last_visit_time"]


class BrowserDownload(models.Model):
    STATES = [
        ("complete", "Complete"),
        ("in_progress", "In Progress"),
        ("interrupted", "Interrupted"),
    ]

    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="browser_downloads"
    )
    url = models.TextField(_("URL"), null=True, blank=True)
    file_name = models.CharField(_("File Name"), max_length=255, null=True, blank=True)
    file_path = models.CharField(_("File Path"), max_length=1024, null=True, blank=True)
    file = models.ForeignKey(
        "File", on_delete=models.SET_NULL, null=True, related_name="downloads"
    )
    download_time = models.DateTimeField(_("Download Time"))
    bytes_downloaded = models.BigIntegerField(_("Bytes Downloaded"))
    state = models.CharField(_("State"), max_length=50, choices=STATES)
    tab_url = models.TextField(_("Tab URL"), null=True, blank=True)

    class Meta:
        verbose_name = _("Browser Download")
        verbose_name_plural = _("Browser Downloads")


class BrowserSearch(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="browser_searches"
    )
    search_term = models.TextField(_("Search Term"))
    search_time = models.DateTimeField(_("Search Time"))
    search_engine = models.CharField(_("Search Engine"), max_length=100)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Browser Search")
        verbose_name_plural = _("Browser Searches")


class BrowserTab(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="browser_tabs"
    )
    url = models.TextField(_("URL"))
    title = models.TextField(_("Title"))
    last_accessed = models.DateTimeField(_("Last Accessed"))
    navigation_state = models.CharField(_("Navigation State"), max_length=50)
    is_incognito = models.BooleanField(_("Is Incognito"), default=False)
    is_pinned = models.BooleanField(_("Is Pinned"), default=False)

    class Meta:
        verbose_name = _("Browser Tab")
        verbose_name_plural = _("Browser Tabs")


class Wallpaper(models.Model):
    TYPE_CHOICES = [
        ("home", "Home"),
        ("lock", "Lock"),
        ("both", "Both"),
    ]

    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="wallpapers"
    )
    type = models.CharField(_("Type"), max_length=50, choices=TYPE_CHOICES)
    image = models.ImageField(
        _("Wallpaper Image"),
        upload_to=partial(get_backup_relative_upload_path, subfolder="wallpapers"),
        null=True,
        blank=True,
    )
    original_path = models.CharField(
        _("Original File Path"), max_length=1024, null=True, blank=True
    )
    is_default = models.BooleanField(_("Is Default"), default=False)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Wallpaper")
        verbose_name_plural = _("Wallpapers")

    def __str__(self):
        return f"{self.type} wallpaper for {self.backup.name}"


class File(models.Model):
    backup = models.ForeignKey(Backup, on_delete=models.CASCADE, related_name="files")
    file_name = models.CharField(_("File Name"), max_length=255, null=True, blank=True)
    file_extension = models.CharField(
        _("File Extension"), max_length=50, null=True, blank=True
    )
    file = models.FileField(
        _("File Content"),
        upload_to=partial(get_backup_relative_upload_path, subfolder="files"),
        null=True,
        blank=True,
        max_length=1024,
    )
    file_size = models.BigIntegerField(_("File Size"), null=True, blank=True)
    mime_type = models.CharField(_("MIME Type"), max_length=100, null=True, blank=True)
    category = models.CharField(_("Category"), max_length=50, null=True, blank=True)
    created_date = models.DateTimeField(_("Created Date"), null=True, blank=True)
    modified_date = models.DateTimeField(_("Modified Date"), null=True, blank=True)
    owner_package = models.CharField(
        _("Owner Package"), max_length=255, null=True, blank=True
    )
    is_hidden = models.BooleanField(_("Is Hidden"), default=False)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("File")
        verbose_name_plural = _("Files")


class Email(models.Model):
    backup = models.ForeignKey(Backup, on_delete=models.CASCADE, related_name="emails")
    email_address = models.EmailField(_("Email Address"), max_length=255)
    account_name = models.CharField(_("Account Name"), max_length=255)
    account_type = models.CharField(_("Account Type"), max_length=50)
    is_primary = models.BooleanField(_("Is Primary"), default=False)
    is_verified = models.BooleanField(_("Is Verified"), default=False)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Email")
        verbose_name_plural = _("Emails")


class BluetoothDevice(models.Model):
    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="bluetooth_devices"
    )
    address = models.CharField(_("MAC Address"), max_length=255)
    name = models.CharField(_("Device Name"), max_length=255, null=True, blank=True)
    device_class = models.IntegerField(_("Device Class"), null=True, blank=True)
    appearance = models.IntegerField(_("Appearance"), null=True, blank=True)
    last_connected = models.DateTimeField(_("Last Connected"), null=True, blank=True)
    bond_state = models.IntegerField(_("Bond State"), null=True, blank=True)
    link_type = models.IntegerField(_("Link Type"), null=True, blank=True)
    uuids = models.TextField(_("UUIDs"), null=True, blank=True)
    manufacturer_data = models.TextField(_("Manufacturer Data"), null=True, blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Bluetooth Device")
        verbose_name_plural = _("Bluetooth Devices")

    def __str__(self):
        return f"{self.name or 'Unknown'} ({self.address})"


class WifiNetwork(models.Model):
    SECURITY_TYPES = [
        ("NONE", "None"),
        ("WPA_PSK", "WPA-PSK"),
        ("WPA2_PSK", "WPA2-PSK"),
        ("WPA_WPA2_PSK", "WPA/WPA2-PSK"),
        ("SAE", "WPA3-SAE"),
        ("EAP", "EAP Enterprise"),
        ("OTHER", "Other"),
    ]

    backup = models.ForeignKey(
        Backup, on_delete=models.CASCADE, related_name="wifi_networks"
    )
    ssid = models.CharField(_("SSID"), max_length=255)
    security_type = models.CharField(
        _("Security Type"), max_length=50, choices=SECURITY_TYPES
    )
    password = models.CharField(_("Password"), max_length=255, null=True, blank=True)
    hidden = models.BooleanField(_("Hidden Network"), default=False)
    frequency = models.CharField(_("Frequency"), max_length=10, null=True, blank=True)
    last_connected = models.DateTimeField(_("Last Connected"), null=True, blank=True)
    is_saved = models.BooleanField(_("Saved Network"), default=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("WiFi Network")
        verbose_name_plural = _("WiFi Networks")

    def __str__(self):
        return self.ssid


class Notification(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notification"
    )
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    is_seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.title[:50]}"