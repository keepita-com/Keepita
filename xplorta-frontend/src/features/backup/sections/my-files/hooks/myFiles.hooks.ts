import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyFiles } from "../api/myFiles.api";
import { useMyFilesStore } from "../store/myFiles.store";
import { buildMyFilesQueryParams } from "../utils/myFiles.utils";
import { MY_FILES_DEFAULT_PAGE_SIZE } from "../constants/myFiles.constants";
import type {
  GetMyFilesParams,
  FileSortField,
  MyFile,
  FileCategory,
} from "../types/myFiles.types";

// ================================
// useMyFiles Hook - React Query for server state
// ================================

export const useMyFiles = (backupId: number) => {
  const queryClient = useQueryClient();

  // Get client state from Zustand (no server state!)
  const { currentPage, searchQuery, filters, sortConfig, selectedCategory } =
    useMyFilesStore();

  // Convert internal sort config to API format
  const getOrderingParam = (): GetMyFilesParams["ordering"] => {
    const { field, order } = sortConfig;
    const fieldMap: Record<FileSortField, string> = {
      name: "file_name",
      size: "file_size",
      date: "created_date",
      type: "file_extension",
    };

    const apiField = fieldMap[field] || "created_date";
    const ordering = order === "desc" ? `-${apiField}` : apiField;
    return ordering as GetMyFilesParams["ordering"];
  };

  // Build query params using the utility function
  const buildQueryParams = (): GetMyFilesParams => {
    const params: GetMyFilesParams = {
      page: currentPage,
      page_size: MY_FILES_DEFAULT_PAGE_SIZE,
      ordering: getOrderingParam(),
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (selectedCategory) {
      params.category = selectedCategory;
    }

    // Add filters using the utility function
    return buildMyFilesQueryParams({
      ...params,
      ...filters,
    });
  };

  // React Query handles ALL server state - no Zustand server state!
  const filesQuery = useQuery({
    queryKey: [
      "myFiles",
      backupId,
      currentPage,
      searchQuery,
      filters,
      sortConfig,
      selectedCategory,
    ],
    queryFn: async () => {
      const params = buildQueryParams();
      const response = await getMyFiles(backupId, params);
      return response;
    },
    enabled: !!backupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Refresh files
  const refreshFiles = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["myFiles", backupId] });
  }, [queryClient, backupId]);

  return {
    // Server state from React Query only
    files: filesQuery.data?.results || [],
    totalResults: filesQuery.data?.total_results || 0,
    totalPages: filesQuery.data?.total_pages || 1,
    hasNext: filesQuery.data?.has_next || false,
    hasPrevious: filesQuery.data?.has_previous || false,
    isLoading: filesQuery.isLoading,
    isError: filesQuery.isError,
    error: filesQuery.error,

    // Actions
    refreshFiles,

    // Query objects (for advanced usage)
    filesQuery,
  };
};

// ================================
// useFilePreview Hook - Client state only
// ================================

export const useFilePreview = () => {
  const { previewData, openPreview, closePreview } = useMyFilesStore();
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleOpenPreview = useCallback(
    (file: MyFile) => {
      setImageError(null);
      setIsImageLoading(true);
      openPreview(file);
    },
    [openPreview]
  );

  const handleClosePreview = useCallback(() => {
    closePreview();
    setIsImageLoading(false);
    setImageError(null);
  }, [closePreview]);

  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsImageLoading(false);
    setImageError("Failed to load image");
  }, []);

  const isPreviewable = useCallback((file: MyFile): boolean => {
    const previewableTypes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // Videos (most browsers support these)
      "video/mp4",
      "video/webm",
      "video/ogg",
      // Audio files
      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/aac",
      "audio/flac",
      "audio/m4a",
      // Text files
      "text/plain",
      "text/html",
      "text/css",
      "text/javascript",
      "application/json",
      "application/xml",
      // PDFs
      "application/pdf",
    ];

    return previewableTypes.includes(file.mime_type.toLowerCase());
  }, []);

  const getPreviewType = useCallback(
    (
      file: MyFile
    ): "image" | "video" | "audio" | "text" | "pdf" | "unsupported" => {
      const mimeType = file.mime_type.toLowerCase();

      if (mimeType.startsWith("image/")) return "image";
      if (mimeType.startsWith("video/")) return "video";
      if (mimeType.startsWith("audio/")) return "audio";
      if (mimeType === "application/pdf") return "pdf";
      if (
        mimeType.startsWith("text/") ||
        mimeType.includes("json") ||
        mimeType.includes("xml")
      )
        return "text";

      return "unsupported";
    },
    []
  );

  const canDownload = useCallback((): boolean => {
    // All files can be downloaded
    return true;
  }, []);

  return {
    // State
    previewData,
    isImageLoading,
    imageError,

    // Actions
    openPreview: handleOpenPreview,
    closePreview: handleClosePreview,
    handleImageLoad,
    handleImageError,

    // Utilities
    isPreviewable,
    getPreviewType,
    canDownload,
  };
};

// ================================
// useMyFilesActions Hook - Client state actions only
// ================================

export const useMyFilesActions = () => {
  const {
    setSearchQuery,
    setSelectedCategory,
    setFilters,
    setCurrentPage,
    setSortConfig,
    setViewMode,
    clearFilters,
  } = useMyFilesStore();

  // Search actions - automatically reset page
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  // Filter actions - automatically reset page
  const handleCategoryFilter = useCallback(
    (category: FileCategory | null) => {
      setSelectedCategory(category);
    },
    [setSelectedCategory]
  );

  const handleFiltersChange = useCallback(
    (newFilters: any) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Sort actions - automatically reset page
  const handleSortChange = useCallback(
    (field: FileSortField, order: "asc" | "desc") => {
      setSortConfig({ field, order });
    },
    [setSortConfig]
  );

  // View mode actions
  const handleViewModeChange = useCallback(
    (mode: "grid" | "list") => {
      setViewMode(mode);
    },
    [setViewMode]
  );

  // Pagination actions
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  return {
    // Search
    handleSearch,
    handleClearSearch,

    // Filters
    handleCategoryFilter,
    handleFiltersChange,
    handleClearFilters,

    // Sort
    handleSortChange,

    // View
    handleViewModeChange,

    // Pagination
    handlePageChange,
  };
};

// ================================
// useMyFilesSelection Hook - Client state for file selection
// ================================

export const useMyFilesSelection = () => {
  const {
    selectedFiles,
    selectFile,
    selectMultipleFiles,
    clearSelection,
    toggleSelection,
  } = useMyFilesStore();

  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const selectAll = useCallback(
    (fileIds: number[]) => {
      selectMultipleFiles(fileIds);
    },
    [selectMultipleFiles]
  );

  const handleClearSelection = useCallback(() => {
    clearSelection();
    setIsSelectionMode(false);
  }, [clearSelection]);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    if (isSelectionMode) {
      clearSelection();
    }
  }, [isSelectionMode, clearSelection]);

  const isSelected = useCallback(
    (fileId: number) => selectedFiles.includes(fileId),
    [selectedFiles]
  );

  return {
    // State
    selectedFiles,
    isSelectionMode,

    // Actions
    toggleSelection,
    selectFile,
    selectAll,
    clearSelection: handleClearSelection,
    toggleSelectionMode,
    isSelected,

    // Computed
    selectedCount: selectedFiles.length,
    hasSelection: selectedFiles.length > 0,
  };
};

// ================================
// useMyFilesExport Hook - Server action with React Query
// ================================

export const useMyFilesExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportFiles = useCallback(
    async (backupId: number, fileIds?: number[]) => {
      setIsExporting(true);
      setExportError(null);

      try {
        // This would call the export API function
        // await exportMyFiles(backupId, { file_ids: fileIds });
        console.log("Exporting files:", { backupId, fileIds });

        // Simulate export delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Export failed";
        setExportError(errorMessage);
        throw error;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const clearExportError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    // State
    isExporting,
    exportError,

    // Actions
    exportFiles,
    clearExportError,
  };
};
