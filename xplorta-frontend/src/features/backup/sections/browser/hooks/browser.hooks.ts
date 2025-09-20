import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useBrowserStore } from "../store/browser.store";
import { BROWSER_QUERY_KEYS } from "../constants/browser.constants";
import * as browserApi from "../api/browser.api";
import type { BrowserTabType } from "../types/browser.types";
import type { BrowserFilters, BrowserSortConfig } from "../types/browser.types";

/**
 * A generic hook for fetching paginated data.
 * It's designed to work with any tab that supports infinite scrolling.
 * @param tab The specific browser tab to fetch data for.
 * @param backupId The ID of the backup.
 * @param fetchFn The API function to call for fetching data.
 * @returns The result of the useInfiniteQuery hook.
 */
const useInfiniteData = <TData>(
  tab: Exclude<BrowserTabType, "Overview">, // This hook is only for list-based tabs
  backupId: string,
  fetchFn: (
    backupId: string,
    filters: BrowserFilters,
    sort: BrowserSortConfig,
    page: number
  ) => Promise<TData>
) => {
  const { tabState } = useBrowserStore();

  // FIX 1: Accessing tabState is now type-safe because the 'tab' parameter's type
  // is guaranteed to be a valid key of tabState.
  const { filters, sortConfig } = tabState[tab];

  // Create a query key that is dependent on all filters and sorting.
  const queryKey = [
    BROWSER_QUERY_KEYS[tab.toLowerCase() as keyof typeof BROWSER_QUERY_KEYS],
    backupId,
    filters,
    sortConfig,
  ];

  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      fetchFn(backupId, filters, sortConfig, pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.has_next ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!backupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Orchestrator Hook for the entire Browser section.
 * This hook manages which data to fetch based on the active tab
 * and provides a unified interface to the UI components.
 */
export const useBrowserManager = (backupId: string) => {
  const {
    activeTab,
    tabState,
    setActiveTab,
    setFilters,
    setSortConfig,
    resetTabState,
  } = useBrowserStore();

  // === Data Fetching Hooks for each tab ===
  // For list-based tabs that use infinite scrolling
  const bookmarksQuery = useInfiniteData(
    "Bookmarks",
    backupId,
    browserApi.getBookmarks
  );
  const historyQuery = useInfiniteData(
    "History",
    backupId,
    browserApi.getHistory
  );
  const downloadsQuery = useInfiniteData(
    "Downloads",
    backupId,
    browserApi.getDownloads
  );
  const searchesQuery = useInfiniteData(
    "Searches",
    backupId,
    browserApi.getSearches
  );
  const tabsQuery = useInfiniteData("Tabs", backupId, browserApi.getTabs);

  // For the "Overview" tab which uses standard queries for aggregate data
  const overviewQuery = useQuery({
    queryKey: [BROWSER_QUERY_KEYS.overview, backupId],
    queryFn: () => browserApi.getBrowserOverview(backupId),
    enabled: !!backupId && activeTab === "Overview",
  });

  const statsQuery = useQuery({
    queryKey: [BROWSER_QUERY_KEYS.statistics, backupId],
    queryFn: () => browserApi.getBrowserStatistics(backupId),
    enabled: !!backupId && activeTab === "Overview",
  });

  // === Logic to select the current query and data based on the active tab ===
  const isOverviewTab = activeTab === "Overview";

  const queryMap = {
    Bookmarks: bookmarksQuery,
    History: historyQuery,
    Downloads: downloadsQuery,
    Searches: searchesQuery,
    Tabs: tabsQuery,
  };

  const currentListQuery = !isOverviewTab ? queryMap[activeTab] : null;

  // FIX 2: The 'flattenedData' calculation is now safe. It only accesses `.pages`
  // for list-based tabs by depending on `currentListQuery`.
  const flattenedData = useMemo(() => {
    if (!currentListQuery || !currentListQuery.data) return [];
    return (
      currentListQuery.data.pages.flatMap((page) => (page as any).results) ?? []
    );
  }, [currentListQuery?.data]);

  return {
    // State from Zustand
    activeTab,
    currentFilters: tabState[activeTab].filters,
    currentSortConfig: tabState[activeTab].sortConfig,

    // Actions from Zustand
    setActiveTab,
    setFilters: (filters: Partial<BrowserFilters>) =>
      setFilters(activeTab, filters),
    setSortConfig: (sortConfig: BrowserSortConfig) =>
      setSortConfig(activeTab, sortConfig),
    resetCurrentTabState: () => resetTabState(activeTab),

    // Unified Data & State for the ACTIVE tab
    // For list tabs:
    data: flattenedData, // Renamed from listData for simplicity in the page component
    isLoading: isOverviewTab
      ? overviewQuery.isLoading || statsQuery.isLoading
      : currentListQuery?.isLoading,
    isFetching: isOverviewTab
      ? overviewQuery.isFetching || statsQuery.isFetching
      : currentListQuery?.isFetching,
    isError: isOverviewTab
      ? overviewQuery.isError || statsQuery.isError
      : currentListQuery?.isError,
    error: isOverviewTab
      ? overviewQuery.error || statsQuery.error
      : currentListQuery?.error,
    hasNextPage: !isOverviewTab && currentListQuery?.hasNextPage,
    isFetchingNextPage: !isOverviewTab && currentListQuery?.isFetchingNextPage,
    fetchNextPage: !isOverviewTab ? currentListQuery?.fetchNextPage : () => {},
    refetch: isOverviewTab ? overviewQuery.refetch : currentListQuery?.refetch,

    // Specific data for the Overview tab, available for the UI to consume
    overviewData: overviewQuery.data,
    statisticsData: statsQuery.data,
  };
};
