import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useAppStore } from "../store/app.store";
import { getApps, getAppPermissions } from "../api/app.api";
import type { GetAppParams, AppStats } from "../types/app.types";

export const APP_QUERY_KEYS = {
  all: ["apps"] as const,
  lists: () => [...APP_QUERY_KEYS.all, "list"] as const,
  list: (backupId: string | number, params?: GetAppParams) =>
    [...APP_QUERY_KEYS.lists(), backupId, params] as const,
  permissions: (backupId: string | number, appId: string | number) =>
    [...APP_QUERY_KEYS.all, "permissions", backupId, appId] as const,
};

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

  const buildParams = useCallback((): GetAppParams => {
    const params: GetAppParams = {
      page_size: 20,
    };

    if (searchQuery?.trim()) {
      params.search = searchQuery.trim();
    }

    const { field, direction } = sortConfig;
    const orderingPrefix = direction === "desc" ? "-" : "";
    params.ordering = `${orderingPrefix}${field}`;

    return params;
  }, [searchQuery, sortConfig]);

  const infiniteQuery = useInfiniteQuery({
    queryKey: APP_QUERY_KEYS.list(backupId, buildParams()),
    queryFn: ({ pageParam }) =>
      getApps(backupId, { ...buildParams(), page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.has_next ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!backupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const allApps = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.results || []);
  }, [infiniteQuery.data?.pages]);

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
    apps: allApps,
    filteredApps: allApps,
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

    data: infiniteQuery.data?.pages?.[infiniteQuery.data.pages.length - 1],

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
    selectAllApps: () => selectAllApps(allApps),
    reset,

    buildParams,
  };
};

export const useAppPermissions = (
  backupId: string | number,
  appId: string | number,
) => {
  return useQuery({
    queryKey: APP_QUERY_KEYS.permissions(backupId, appId),
    queryFn: () => getAppPermissions(backupId, appId),
    enabled: !!backupId && !!appId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
