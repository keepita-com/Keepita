from django.db.models import Count, Prefetch, Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from config.pagination import DefaultPagination
from dashboard.models import (
    Backup,
    HomeScreenFolder,
    HomeScreenItem,
    HomeScreenLayout,
    Wallpaper,
)
from dashboard.permissions import IsBackupOwner

from .filters import (
    HomeScreenFolderFilter,
    HomeScreenItemFilter,
    HomeScreenLayoutFilter,
    WallpaperFilter,
)
from .serializers import (
    HomeScreenFolderSerializer,
    HomeScreenItemSerializer,
    HomeScreenLayoutSerializer,
    HomeScreenOverviewSerializer,
    WallpaperSerializer,
)


class HomeScreenLayoutViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HomeScreenLayout.objects.all()
    serializer_class = HomeScreenLayoutSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = HomeScreenLayoutFilter
    search_fields = []
    ordering_fields = ["created_at", "rows", "columns", "page_count"]
    ordering = ["-created_at"]
    pagination_class = DefaultPagination

    def get_queryset(self):
        backup_pk = self.kwargs.get("backup_pk")
        queryset = HomeScreenLayout.objects.filter(
            backup__user=self.request.user
        ).prefetch_related("folders__items", "items", "backup__wallpapers")

        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)

        return queryset

    @action(detail=True, methods=["get"])
    def overview(self, request):
        layout = self.get_object()
        serializer = HomeScreenOverviewSerializer(layout, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def pages(self, request, pk=None):
        layout = self.get_object()
        pages = []

        for page_index in range(layout.page_count):
            page_items = layout.items.filter(
                screen_index=page_index,
                location__in=["home", "homeOnly"],
                folder__isnull=True,
            ).order_by("y", "x")

            page_folders = (
                layout.folders.filter(screen_index=page_index)
                .prefetch_related("items")
                .order_by("y", "x")
            )

            pages.append(
                {
                    "page_index": page_index,
                    "items": HomeScreenItemSerializer(page_items, many=True).data,
                    "folders": HomeScreenFolderSerializer(page_folders, many=True).data,
                }
            )

        return Response(
            {"layout_id": layout.id, "total_pages": layout.page_count, "pages": pages}
        )

    @action(detail=True, methods=["get"])
    def hotseat(self, request, pk=None):
        layout = self.get_object()
        hotseat_items = layout.items.filter(location="hotseat").order_by("x")
        serializer = HomeScreenItemSerializer(hotseat_items, many=True)
        return Response({"layout_id": layout.id, "hotseat_items": serializer.data})

    @action(detail=True, methods=["get"])
    def statistics(self, request, pk=None):
        layout = self.get_object()

        total_items = layout.items.count()
        total_folders = layout.folders.count()

        item_types = (
            layout.items.values("item_type")
            .annotate(count=Count("id"))
            .order_by("item_type")
        )

        location_breakdown = (
            layout.items.values("location")
            .annotate(count=Count("id"))
            .order_by("location")
        )

        page_breakdown = []
        for page_index in range(layout.page_count):
            page_items = layout.items.filter(screen_index=page_index).count()
            page_folders = layout.folders.filter(screen_index=page_index).count()
            page_breakdown.append(
                {
                    "page_index": page_index,
                    "items_count": page_items,
                    "folders_count": page_folders,
                    "total_count": page_items + page_folders,
                }
            )

        folder_stats = layout.folders.annotate(items_count=Count("items")).aggregate(
            avg_items_per_folder=(
                Count("items") / Count("id") if layout.folders.count() > 0 else 0
            ),
            max_items_in_folder=Count("items"),
            min_items_in_folder=Count("items"),
        )

        return Response(
            {
                "layout_id": layout.id,
                "totals": {
                    "items": total_items,
                    "folders": total_folders,
                    "hidden_items": layout.items.filter(is_hidden=True).count(),
                    "widgets": layout.items.filter(item_type="widget").count(),
                    "apps": layout.items.filter(item_type="app").count(),
                },
                "item_types": list(item_types),
                "location_breakdown": list(location_breakdown),
                "page_breakdown": page_breakdown,
                "folder_statistics": folder_stats,
                "layout_config": {
                    "rows": layout.rows,
                    "columns": layout.columns,
                    "page_count": layout.page_count,
                    "has_zero_page": layout.has_zero_page,
                    "is_portrait_only": layout.is_portrait_only,
                    "layout_locked": layout.layout_locked,
                    "badge_enabled": layout.badge_enabled,
                },
            }
        )


class HomeScreenFolderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HomeScreenFolder.objects.all()
    serializer_class = HomeScreenFolderSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = HomeScreenFolderFilter
    search_fields = ["title"]
    ordering_fields = ["created_at", "title", "screen_index", "x", "y"]
    ordering = ["screen_index", "y", "x"]

    def get_queryset(self):
        backup_pk = self.kwargs.get("backup_pk")
        queryset = (
            HomeScreenFolder.objects.filter(layout__backup__user=self.request.user)
            .prefetch_related("items")
            .annotate(items_count=Count("items"))
        )

        if backup_pk:
            queryset = queryset.filter(layout__backup_id=backup_pk)

        return queryset

    @action(detail=True, methods=["get"])
    def items(self, request, pk=None):
        folder = self.get_object()
        items = folder.items.all().order_by("title")
        serializer = HomeScreenItemSerializer(items, many=True)
        return Response(
            {
                "folder_id": folder.id,
                "folder_title": folder.title,
                "items_count": items.count(),
                "items": serializer.data,
            }
        )


class HomeScreenItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HomeScreenItem.objects.all()
    serializer_class = HomeScreenItemSerializer
    permission_classes = [IsAuthenticated, IsBackupOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = HomeScreenItemFilter
    search_fields = ["title", "package_name", "class_name"]
    ordering_fields = ["created_at", "title", "screen_index", "x", "y", "item_type"]
    ordering = ["screen_index", "y", "x"]

    def get_queryset(self):
        backup_pk = self.kwargs.get("backup_pk")
        queryset = HomeScreenItem.objects.filter(
            layout__backup__user=self.request.user
        ).select_related("layout", "folder")

        if backup_pk:
            queryset = queryset.filter(layout__backup_id=backup_pk)

        return queryset

    @action(detail=False, methods=["get"])
    def by_type(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        item_types = {}
        for item_type, label in HomeScreenItem.ITEM_TYPES:
            items = queryset.filter(item_type=item_type)
            item_types[item_type] = {
                "label": label,
                "count": items.count(),
                "items": HomeScreenItemSerializer(items[:20], many=True).data,
            }

        return Response(item_types)

    @action(detail=False, methods=["get"])
    def apps(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        apps = queryset.filter(item_type="app").order_by("title")
        serializer = self.get_serializer(apps, many=True)
        return Response({"count": apps.count(), "apps": serializer.data})

    @action(detail=False, methods=["get"])
    def widgets(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        widgets = queryset.filter(item_type="widget").order_by("title")
        serializer = self.get_serializer(widgets, many=True)
        return Response({"count": widgets.count(), "widgets": serializer.data})


class WallpaperViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Wallpaper.objects.all()
    serializer_class = WallpaperSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = WallpaperFilter
    search_fields = ["original_path"]
    ordering_fields = ["created_at", "type", "is_default"]
    ordering = ["-created_at"]

    def get_queryset(self):
        backup_pk = self.kwargs.get("backup_pk")
        queryset = Wallpaper.objects.filter(backup__user=self.request.user)

        if backup_pk:
            queryset = queryset.filter(backup_id=backup_pk)

        return queryset

    @action(detail=False, methods=["get"])
    def by_type(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        wallpaper_types = {}
        for wallpaper_type, label in Wallpaper.TYPE_CHOICES:
            wallpapers = queryset.filter(type=wallpaper_type)
            wallpaper_types[wallpaper_type] = {
                "label": label,
                "count": wallpapers.count(),
                "wallpapers": WallpaperSerializer(
                    wallpapers, many=True, context={"request": request}
                ).data,
            }

        return Response(wallpaper_types)


class HomeScreenCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        backup_pk = self.kwargs.get("backup_pk")
        backup = get_object_or_404(Backup, id=backup_pk, user=request.user)

        try:
            layout = backup.home_screen_layouts.first()
            if not layout:
                return Response(
                    {"error": "No home screen layout found for this backup"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        except HomeScreenLayout.DoesNotExist:
            return Response(
                {"error": "Home screen layout not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        wallpapers = backup.wallpapers.all()

        pages = []
        for page_index in range(layout.page_count):
            page_items = layout.items.filter(
                screen_index=page_index,
                location__in=["home", "homeOnly"],
                folder__isnull=True,
            ).order_by("y", "x")

            page_folders = (
                layout.folders.filter(screen_index=page_index)
                .prefetch_related("items")
                .order_by("y", "x")
            )

            pages.append(
                {
                    "page_index": page_index,
                    "items": HomeScreenItemSerializer(page_items, many=True).data,
                    "folders": HomeScreenFolderSerializer(page_folders, many=True).data,
                }
            )

        hotseat_items = layout.items.filter(location="hotseat").order_by("x")

        return Response(
            {
                "backup_id": backup.id,
                "layout": HomeScreenLayoutSerializer(layout).data,
                "wallpapers": WallpaperSerializer(
                    wallpapers, many=True, context={"request": request}
                ).data,
                "pages": pages,
                "hotseat": HomeScreenItemSerializer(hotseat_items, many=True).data,
                "statistics": {
                    "total_items": layout.items.count(),
                    "total_folders": layout.folders.count(),
                    "total_pages": layout.page_count,
                    "apps_count": layout.items.filter(item_type="app").count(),
                    "widgets_count": layout.items.filter(item_type="widget").count(),
                    "hidden_items": layout.items.filter(is_hidden=True).count(),
                },
            }
        )


class HomeScreenVisualGridView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        backup_pk = self.kwargs.get("backup_pk")
        backup = get_object_or_404(Backup, id=backup_pk, user=request.user)
        layout = backup.home_screen_layouts.first()

        if not layout:
            return Response(
                {"error": "No home screen layout found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        visual_pages = []

        for page_index in range(layout.page_count):
            grid = [[None for _ in range(layout.columns)] for _ in range(layout.rows)]

            page_items = layout.items.filter(
                screen_index=page_index,
                location__in=["home", "homeOnly"],
                folder__isnull=True,
            )

            for item in page_items:
                if 0 <= item.y < layout.rows and 0 <= item.x < layout.columns:
                    grid[item.y][item.x] = {
                        "type": "item",
                        "data": HomeScreenItemSerializer(item).data,
                    }

            page_folders = layout.folders.filter(screen_index=page_index)

            for folder in page_folders:
                if 0 <= folder.y < layout.rows and 0 <= folder.x < layout.columns:
                    grid[folder.y][folder.x] = {
                        "type": "folder",
                        "data": HomeScreenFolderSerializer(folder).data,
                    }

            visual_pages.append(
                {
                    "page_index": page_index,
                    "grid": grid,
                    "rows": layout.rows,
                    "columns": layout.columns,
                }
            )

        hotseat_grid = [None for _ in range(layout.columns)]
        hotseat_items = layout.items.filter(location="hotseat")

        for item in hotseat_items:
            if 0 <= item.x < layout.columns:
                hotseat_grid[item.x] = {
                    "type": "item",
                    "data": HomeScreenItemSerializer(item).data,
                }

        return Response(
            {
                "backup_id": backup.id,
                "layout_config": {
                    "rows": layout.rows,
                    "columns": layout.columns,
                    "page_count": layout.page_count,
                    "has_zero_page": layout.has_zero_page,
                },
                "visual_pages": visual_pages,
                "hotseat_grid": hotseat_grid,
                "wallpapers": WallpaperSerializer(
                    backup.wallpapers.all(), many=True, context={"request": request}
                ).data,
            }
        )
