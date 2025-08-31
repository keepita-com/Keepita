import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { queryClient } from "../../../core/config/queryClient";
import type { usePagination } from "../../../core/hooks/usePagination";
import type { ApiResponseList } from "../../../core/types/apiResponse";
import { useBackupApi } from "../api/backup.api";
import type { BackupFilters } from "../components/SearchAndFilterBar";
import type { BackupItem } from "../store/backup.store";
import { useBackupStore } from "../store/backup.store";
import { useBackupToastStore } from "../store/uploadToastStore";
import { buildBackupParams } from "../utils/backup.utils";

export interface StepData {
  name: string;
  status: "processing" | "completed" | "failed";
  timestamp: string;
  description: string;
  progress_percent: number;
}

export interface BackupProgress {
  id: string;
  backup: number;
  status: "processing" | "completed" | "failed";
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  steps_data: {
    [key: string]: StepData;
  };
  created_at: string;
  updated_at: string;
  logId: string;
}

export type UploadPhaseUnion =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

export const useBackupFilters = (
  pagination: ReturnType<typeof usePagination>
) => {
  const searchQuery = useBackupStore((s) => s.searchQuery);
  const filters = useBackupStore((s) => s.filters);
  const sortConfig = useBackupStore((s) => s.sortConfig);

  const showCreateForm = useBackupStore((s) => s.showCreateForm);
  const deletingId = useBackupStore((s) => s.deletingId);

  const setSearchQuery = useBackupStore((s) => s.setSearchQuery);
  const setSortConfig = useBackupStore((s) => s.setSortConfig);
  const setFilters = useBackupStore((s) => s.setFilters);
  const setDeletingId = useBackupStore((s) => s.setDeletingId);
  const setShowCreateForm = useBackupStore((s) => s.setShowCreateForm);

  const { deleteBackup } = useDeleteBackup();

  const handleDelete = async (id: string) => {
    setDeletingId(parseInt(id, 10));
    await deleteBackup(id);
    setDeletingId(null);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    pagination.resetToFirstPage();
  };

  const handleFilterChange = (newFilters: BackupFilters) => {
    setFilters(newFilters);
    pagination.resetToFirstPage();
  };

  const handleSortChange = (field: string, direction: "asc" | "desc") => {
    setSortConfig({ field, direction });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({
      status: null,
      customDateFrom: undefined,
      customDateTo: undefined,
    });
    pagination.resetToFirstPage();
  };

  const handleRemoveFilter = (filterType: keyof BackupFilters | "search") => {
    if (filterType === "search") {
      setSearchQuery("");
    } else if (filterType === "customDateFrom") {
      setFilters({
        ...filters,
        customDateFrom: undefined,
      });
    } else if (filterType === "customDateTo") {
      setFilters({
        ...filters,
        customDateTo: undefined,
      });
    } else {
      setFilters({
        ...filters,
        [filterType]: null,
      });
    }
    pagination.resetToFirstPage();
  };

  const handleRemoveDateRange = () => {
    setFilters({
      ...filters,
      customDateFrom: undefined,
      customDateTo: undefined,
    });
    pagination.resetToFirstPage();
  };

  return {
    searchQuery,
    filters,
    sortConfig,
    showCreateForm,
    deletingId,

    // actions
    handleDelete,
    handleCreateSuccess,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    clearAllFilters,
    handleRemoveFilter,
    handleRemoveDateRange,
    setShowCreateForm,
  };
};

export const useBackupManager = ({
  pagination,
}: {
  pagination: {
    page: ReturnType<typeof usePagination>["page"];
    pageSize: ReturnType<typeof usePagination>["pageSize"];
  };
}) => {
  const { getBackups } = useBackupApi();

  const searchQuery = useBackupStore((s) => s.searchQuery);
  const filters = useBackupStore((s) => s.filters);
  const sortConfig = useBackupStore((s) => s.sortConfig);

  // Build API parameters using useMemo for optimization
  const params = useMemo(
    () =>
      buildBackupParams(
        pagination.page,
        pagination.pageSize,
        searchQuery,
        filters,
        sortConfig
      ),
    [pagination.page, pagination.pageSize, searchQuery, filters, sortConfig]
  );

  // Create a stable query key that includes all search/filter/sort parameters
  const queryKey = [
    "backups",
    params.page || 1,
    params.page_size || 6,
    params.search,
    params.ordering,
    params.status,
    params.created_after,
    params.created_before,
  ];

  const { data, error, refetch, isFetching } = useQuery<
    ApiResponseList<BackupItem[]>
  >({
    queryKey,
    queryFn: async () => {
      const response = await getBackups(params);
      return response;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    backups: data?.results || [],
    pagination: data
      ? {
          currentPage: params.page || 1,
          totalPages: data.total_pages,
          hasNext: data.has_next,
          hasPrevious: data.has_previous,
          totalResults: data.total_results,
        }
      : null,
    error,
    isLoading: isFetching,
    refetch,
  };
};

export const useBackupDetails = (id: string | undefined) => {
  const { selectBackup } = useBackupStore();
  const { getBackup } = useBackupApi();
  const [isLoading, setIsLoading] = useState(false);

  const { data, error, refetch } = useQuery({
    queryKey: ["backup", id],
    queryFn: async () => {
      if (!id) return null;
      setIsLoading(true);
      try {
        const response = await getBackup(id);
        if (response) {
          selectBackup(response);
        }
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    enabled: !!id,
  });
  return {
    backup: data as BackupItem | null,
    error,
    isLoading,
    refetch,
  };
};

export const useCreateBackup = () => {
  const setBackupInProgress = useBackupStore(
    (state) => state.setBackupInProgress
  );
  const { createBackupWithProgress } = useBackupApi();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<UploadPhaseUnion>("idle");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [backupCreationData, setBackupCreationData] = useState<{
    backup_id: number;
    log_id: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const setStoreUploadPhase = useBackupStore((state) => state.setUploadPhase);

  useEffect(() => {
    setStoreUploadPhase(uploadPhase);
  }, [uploadPhase]);

  const createBackup = async (params: { name: string; backup_file: File }) => {
    try {
      setIsLoading(true);
      setBackupInProgress(true);
      setError(null);
      setSuccess(false);
      setUploadProgress(0);
      setUploadPhase("uploading");

      const response = await createBackupWithProgress({
        name: params.name,
        backup_file: params.backup_file,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentComplete =
              (progressEvent.loaded / progressEvent.total) * 100;
            // Cap at 98% until server responds to avoid appearance of being stuck at 100%
            setUploadProgress(Math.min(percentComplete, 98));
          }
        },
      });

      // Upload completed successfully
      setUploadProgress(100);
      setUploadPhase("processing");

      if (response) {
        setBackupCreationData({
          backup_id: response.backup_id,
          log_id: response.log_id,
        });
        setSuccess(true);
        setUploadPhase("completed");
        queryClient.invalidateQueries({ queryKey: ["backups"] });
        queryClient.invalidateQueries({
          queryKey: ["user", "backups", "stats"],
        });
      }

      return response;
    } catch (err) {
      setUploadPhase("failed");
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create backup");
      }
      setSuccess(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBackup,
    backupCreationData,
    isLoading,
    uploadProgress,
    uploadPhase,
    error,
    success,
  };
};

export const useDeleteBackup = () => {
  const { removeBackup } = useBackupStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { deleteBackup: deleteBackupRequest } = useBackupApi();
  const queryClient = useQueryClient();

  const deleteBackup = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      await deleteBackupRequest(id);
      removeBackup(id);

      queryClient.invalidateQueries({ queryKey: ["backups"] });

      setSuccess(true);
      return true;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete backup");
      }
      setSuccess(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteBackup,
    isLoading,
    error,
    success,
  };
};

export const useBackupProgress = (logId?: string) => {
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const { setBackupInProgress } = useBackupStore();
  const { getBackupProgress } = useBackupApi();

  // Memoize fetchProgress with useCallback to avoid recreating on every render
  const fetchProgress = useCallback(async () => {
    if (!logId) return null;

    try {
      setIsLoading(true);
      const progressData = await getBackupProgress(logId);

      const formattedStepsData = progressData.steps_data || {};

      // Guard against malformed progress data
      const normalizedProgressData = {
        ...progressData,
        current_step: progressData.current_step || 1,
        total_steps: progressData.total_steps || 5,
        progress_percentage:
          typeof progressData.progress_percentage === "number"
            ? progressData.progress_percentage
            : 0,
        status: progressData.status || "processing",
        steps_data: formattedStepsData,
        logId,
      };

      setProgress(normalizedProgressData);

      if (
        progressData.status === "completed" ||
        progressData.status === "failed"
      ) {
        if (pollingIntervalRef.current) {
          window.clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setBackupInProgress(false);

          queryClient.invalidateQueries({
            queryKey: ["user", "notifications"],
          });
          queryClient.invalidateQueries({ queryKey: ["backups"] });

          queryClient.invalidateQueries({
            queryKey: ["user", "backups", "stats"],
          });
        }
      }

      return normalizedProgressData;
    } catch (err) {
      console.error("Error fetching backup progress:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch backup progress");
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logId, getBackupProgress, setBackupInProgress]);

  const initializedRef = useRef(false);

  const fetchProgressRef = useRef(fetchProgress);

  const setBackupCreationId = useBackupToastStore(
    (state) => state.setBackupCreationId
  );

  useEffect(() => {
    fetchProgressRef.current = fetchProgress;
  }, [fetchProgress]);

  useEffect(() => {
    if (logId) {
      initializedRef.current = false;
    }

    let isMounted = true;

    const startPolling = () => {
      // Only start polling if we have a logId, no existing polling interval, and we haven't initialized yet
      if (
        logId &&
        !pollingIntervalRef.current &&
        !initializedRef.current &&
        isMounted
      ) {
        // Mark as initialized to prevent duplicate initialization
        initializedRef.current = true;

        // Show initial "pending" state immediately for better UX
        setProgress((prevProgress) => ({
          ...prevProgress,
          status: "processing",
          current_step: 1,
          total_steps: 5,
          progress_percentage: 0,
          steps_data: prevProgress?.steps_data || {},
          logId: logId,
          id: prevProgress?.id || "",
          backup: prevProgress?.backup || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        // Immediately fetch progress, then start polling every 5 seconds
        const initialFetch = async () => {
          setBackupCreationId(logId);

          try {
            const initialData = await fetchProgressRef.current();

            // Start regular polling - only if component is still mounted and first fetch succeeded
            if (isMounted && initialData) {
              pollingIntervalRef.current = window.setInterval(
                () => {
                  if (isMounted) {
                    fetchProgressRef.current();
                  }
                },
                5000 // Continue polling every 5 seconds
              );
            }
          } catch (error) {
            console.error("Error in initial backup progress fetch:", error);
          }
        };

        initialFetch();
      }
    };

    startPolling();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;

      if (progress?.status === "completed" || progress?.status === "failed") {
        setBackupCreationId(null);
      }

      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [logId]);

  return {
    progress,
    setProgress,
    isLoading,
    error,
    isPolling: pollingIntervalRef.current !== null,
    refetch: fetchProgress,
  };
};
