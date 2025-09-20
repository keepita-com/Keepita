from rest_framework import serializers

from dashboard.models import (
    ApkList,
    HomeScreenFolder,
    HomeScreenItem,
    HomeScreenLayout,
    Wallpaper,
)

from ..utils.storage import generate_presigned_url


class ApkListSerializer(serializers.ModelSerializer):
    icon_url = serializers.SerializerMethodField()

    class Meta:
        model = ApkList
        fields = [
            "id",
            "apk_name",
            "icon_url",
            "version_name",
            "size",
            "last_time_used",
            "recent_used",
        ]

    def get_icon_url(self, obj):
        return generate_presigned_url(obj.icon)


class WallpaperSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Wallpaper
        fields = [
            "id",
            "type",
            "original_path",
            "image_url",
            "is_default",
            "created_at",
        ]

    def get_image_url(self, obj):
        return generate_presigned_url(obj.image)


class HomeScreenItemSerializer(serializers.ModelSerializer):
    app_name = serializers.SerializerMethodField()
    app_icon_url = serializers.SerializerMethodField()

    class Meta:
        model = HomeScreenItem
        fields = [
            "id",
            "item_type",
            "screen_index",
            "x",
            "y",
            "span_x",
            "span_y",
            "package_name",
            "class_name",
            "title",
            "app_widget_id",
            "is_hidden",
            "location",
            "created_at",
            "apk",
            "app_name",
            "app_icon_url",
        ]

    def get_app_name(self, obj):
        if obj.apk:
            return obj.apk.apk_name
        return obj.title

    def get_app_icon_url(self, obj):
        if obj.apk:
            return generate_presigned_url(obj.apk.icon)
        return None


class HomeScreenFolderSerializer(serializers.ModelSerializer):
    items = HomeScreenItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = HomeScreenFolder
        fields = [
            "id",
            "title",
            "screen_index",
            "x",
            "y",
            "color",
            "options",
            "items",
            "items_count",
            "created_at",
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class HomeScreenLayoutSerializer(serializers.ModelSerializer):
    folders = HomeScreenFolderSerializer(many=True, read_only=True)
    items = HomeScreenItemSerializer(many=True, read_only=True)
    wallpapers = serializers.SerializerMethodField()

    class Meta:
        model = HomeScreenLayout
        fields = [
            "id",
            "rows",
            "columns",
            "page_count",
            "has_zero_page",
            "is_portrait_only",
            "notification_panel_enabled",
            "layout_locked",
            "quick_access_enabled",
            "badge_enabled",
            "folders",
            "items",
            "wallpapers",
            "created_at",
        ]

    def get_wallpapers(self, obj):
        wallpapers = obj.backup.wallpapers.all()
        return WallpaperSerializer(wallpapers, many=True, context=self.context).data


class HomeScreenPageSerializer(serializers.Serializer):
    page_index = serializers.IntegerField()
    items = HomeScreenItemSerializer(many=True)
    folders = HomeScreenFolderSerializer(many=True)


class HomeScreenOverviewSerializer(serializers.ModelSerializer):
    layout = HomeScreenLayoutSerializer(read_only=True)
    pages = serializers.SerializerMethodField()
    hotseat_items = serializers.SerializerMethodField()
    statistics = serializers.SerializerMethodField()

    class Meta:
        model = HomeScreenLayout
        fields = ["layout", "pages", "hotseat_items", "statistics"]

    def get_pages(self, obj):
        pages = []

        for page_index in range(obj.page_count):
            page_items = obj.items.filter(
                screen_index=page_index, location__in=["home", "homeOnly"]
            ).exclude(folder__isnull=False)

            page_folders = obj.folders.filter(screen_index=page_index)

            pages.append(
                {
                    "page_index": page_index,
                    "items": HomeScreenItemSerializer(page_items, many=True).data,
                    "folders": HomeScreenFolderSerializer(page_folders, many=True).data,
                }
            )

        return pages

    def get_hotseat_items(self, obj):
        hotseat_items = obj.items.filter(location="hotseat")
        return HomeScreenItemSerializer(hotseat_items, many=True).data

    def get_statistics(self, obj):
        return {
            "total_items": obj.items.count(),
            "total_folders": obj.folders.count(),
            "total_apps": obj.items.filter(item_type="app").count(),
            "total_widgets": obj.items.filter(item_type="widget").count(),
            "hidden_items": obj.items.filter(is_hidden=True).count(),
            "hotseat_items": obj.items.filter(location="hotseat").count(),
        }
