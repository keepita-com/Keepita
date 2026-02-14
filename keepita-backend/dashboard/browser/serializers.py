from rest_framework import serializers

from dashboard.models import (BrowserBookmark, BrowserDownload, BrowserHistory,
                              BrowserSearch, BrowserTab)

class BrowserBookmarkSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = BrowserBookmark
        fields = ['id', 'title', 'url', 'created_at', 'updated_at']

class BrowserHistorySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = BrowserHistory
        fields = [
            'id', 'url', 'title', 'visit_count', 'typed_count', 
            'last_visit_time', 'hidden', 'source', 'created_at'
        ]

class BrowserDownloadSerializer(serializers.ModelSerializer):
    
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = BrowserDownload
        fields = [
            'id', 'url', 'file_name', 'file_path', 'download_time',
            'bytes_downloaded', 'file_size_mb', 'state', 'tab_url'
        ]
    
    def get_file_size_mb(self, obj):
        if obj.bytes_downloaded:
            return round(obj.bytes_downloaded / (1024 * 1024), 2)
        return 0

class BrowserSearchSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = BrowserSearch
        fields = [
            'id', 'search_term', 'search_time', 'search_engine', 'created_at'
        ]

class BrowserTabSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = BrowserTab
        fields = [
            'id', 'url', 'title', 'last_accessed', 'navigation_state',
            'is_incognito', 'is_pinned'
        ]

class BrowserDetailSerializer(serializers.Serializer):
    
    total_bookmarks = serializers.IntegerField()
    total_history = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    total_searches = serializers.IntegerField()
    total_tabs = serializers.IntegerField()
    
    recent_bookmarks = BrowserBookmarkSerializer(many=True)
    recent_history = BrowserHistorySerializer(many=True)
    recent_downloads = BrowserDownloadSerializer(many=True)
    
    top_domains = serializers.ListField()
    
    download_stats = serializers.DictField()
