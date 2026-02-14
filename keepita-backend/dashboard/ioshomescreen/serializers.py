
from rest_framework import serializers

from dashboard.models import (IOSHomeScreenItem, IOSHomeScreenLayout,
                              IOSWidgetItem, Wallpaper)
from dashboard.utils.storage import generate_presigned_url

class WallpaperSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Wallpaper
        fields = ['id', 'type', 'original_path', 'image_url', 'created_at']
        ref_name = 'IOSWallpaper'
    
    def get_image_url(self, obj):
        if obj.image:
            return generate_presigned_url(obj.image)
        return None

class IOSWidgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = IOSWidgetItem
        fields = ['id', 'position_in_stack', 'bundle_identifier', 'widget_kind']

class IOSHomeScreenItemSerializer(serializers.ModelSerializer):
    child_items = serializers.SerializerMethodField()
    widgets_in_stack = IOSWidgetItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = IOSHomeScreenItem
        fields = [
            'id', 'item_type', 'location', 'page_index', 'position_on_page',
            'x', 'y', 'span_x', 'span_y', 'title', 'display_name',
            'bundle_identifier', 'grid_size', 'child_items', 'widgets_in_stack'
        ]
    
    def get_child_items(self, obj):
        if obj.item_type == 'FOLDER':
            children = obj.child_items.order_by('page_index', 'position_on_page')
            return IOSHomeScreenItemSerializer(children, many=True, context=self.context).data
        return None

class IOSHomeScreenLayoutSerializer(serializers.ModelSerializer):
    dock_items = serializers.SerializerMethodField()
    pages = serializers.SerializerMethodField()
    wallpapers = serializers.SerializerMethodField()
    statistics = serializers.SerializerMethodField()
    
    class Meta:
        model = IOSHomeScreenLayout
        fields = ['id', 'backup', 'widget_version', 'wallpapers', 'dock_items', 'pages', 'statistics']
    
    def get_wallpapers(self, obj):
        wallpapers = Wallpaper.objects.filter(backup=obj.backup)
        return WallpaperSerializer(wallpapers, many=True, context=self.context).data
        
    def get_dock_items(self, obj):
        items = obj.items.filter(location='DOCK', parent_folder__isnull=True).order_by('position_on_page')
        return IOSHomeScreenItemSerializer(items, many=True, context=self.context).data

    def get_pages(self, obj):
        page_data = {}
        home_screen_items = obj.items.filter(location='HOME_SCREEN', parent_folder__isnull=True).order_by('page_index', 'position_on_page')
        
        for item in home_screen_items:
            if item.page_index not in page_data:
                page_data[item.page_index] = []
            page_data[item.page_index].append(item)
        
        pages_list = [
            {
                "page_index": index,
                "items": IOSHomeScreenItemSerializer(items, many=True, context=self.context).data
            } for index, items in sorted(page_data.items())
        ]
        return pages_list

    def get_statistics(self, obj):
        all_items = obj.items.all()
        return {
            'total_items': all_items.count(),
            'total_apps': all_items.filter(item_type='APP').count(),
            'total_folders': all_items.filter(item_type='FOLDER').count(),
            'total_widget_stacks': all_items.filter(item_type='WIDGET_STACK').count(),
            'page_count': obj.items.filter(location='HOME_SCREEN').values('page_index').distinct().count(),
        }