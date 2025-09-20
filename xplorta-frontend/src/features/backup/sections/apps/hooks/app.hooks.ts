/**
 * app.hooks.ts
 * Refactored app hooks - React Query for server state, Zustand for client state only
 */
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useAppStore } from "../store/app.store";
import { getApps, getAppPermissions } from "../api/app.api";
import type { GetAppParams, AppStats } from "../types/app.types";

// Query keys for React Query
export const APP_QUERY_KEYS = {
  all: ["apps"] as const,
  lists: () => [...APP_QUERY_KEYS.all, "list"] as const,
  list: (backupId: string | number, params?: GetAppParams) =>
    [...APP_QUERY_KEYS.lists(), backupId, params] as const,
  permissions: (backupId: string | number, appId: string | number) =>
    [...APP_QUERY_KEYS.all, "permissions", backupId, appId] as const,
};

/**
 * Main app manager hook with infinite scroll
 * React Query is the single source of truth for server state
 * Zustand is only used for client-side state (search, sorting)
 */
export const useAppManager = (backupId: string | number) => {
  const {
    searchQuery,
    sortConfig,
    viewMode,
    selectedApp,
    selectedApps,
    setSearchQuery,
    setSortConfig,
    setViewMode,
    selectApp,
    selectMultipleApps,
    toggleAppSelection,
    clearSelection,
    selectAllApps,
    reset,
  } = useAppStore();

  // Build API parameters from client-side state
  const buildParams = useCallback((): GetAppParams => {
    const params: GetAppParams = {
      page_size: 20,
    };

    if (searchQuery?.trim()) {
      params.search = searchQuery.trim();
    }

    // Build ordering parameter from sort config
    const { field, direction } = sortConfig;
    const orderingPrefix = direction === "desc" ? "-" : "";
    params.ordering = `${orderingPrefix}${field}`;

    return params;
  }, [searchQuery, sortConfig]);

  // Use infinite scroll query for Samsung-style app loading
  const infiniteQuery = useInfiniteQuery({
    queryKey: APP_QUERY_KEYS.list(backupId, buildParams()),
    queryFn: ({ pageParam }) =>
      getApps(backupId, { ...buildParams(), page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.has_next ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!backupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Flatten all app pages into a single array (computed from React Query data)
  const allApps = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.results || []);
  }, [infiniteQuery.data?.pages]);

  // Calculate stats from React Query data
  const stats = useMemo((): AppStats => {
    const totalFromBackend = infiniteQuery.data?.pages[0]?.total_results || 0;
    const recentlyUsed = allApps.filter((app) => app.recent_used).length;

    return {
      total: totalFromBackend,
      recentlyUsed,
    };
  }, [allApps, infiniteQuery.data]);

  const refresh = useCallback(() => {
    infiniteQuery.refetch();
  }, [infiniteQuery]);

  return {
    // Server state from React Query
    apps: allApps,
    filteredApps: allApps, // Backend handles filtering via API params
    stats,
    isLoading: infiniteQuery.isLoading,
    isError: infiniteQuery.isError,
    error: infiniteQuery.error,
    isSuccess: infiniteQuery.isSuccess,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    refetch: infiniteQuery.refetch,
    refresh,

    // Latest page data for compatibility
    data: infiniteQuery.data?.pages?.[infiniteQuery.data.pages.length - 1],

    // Client state from Zustand
    searchQuery,
    sortConfig,
    viewMode,
    selectedApp,
    selectedApps,

    // Client actions from Zustand
    setSearchQuery,
    setSortConfig,
    setViewMode,
    selectApp,
    selectMultipleApps,
    toggleAppSelection,
    clearSelection,
    selectAllApps: () => selectAllApps(allApps),
    reset,

    // Computed values
    buildParams,
  };
};

/**
 * Hook for fetching app permissions
 */
export const useAppPermissions = (
  backupId: string | number,
  appId: string | number
) => {
  return useQuery({
    queryKey: APP_QUERY_KEYS.permissions(backupId, appId),
    queryFn: () => getAppPermissions(backupId, appId),
    enabled: !!backupId && !!appId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
