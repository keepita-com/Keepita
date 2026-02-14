import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useBrowserStore } from "../store/browser.store";
import { BROWSER_QUERY_KEYS } from "../constants/browser.constants";
import * as browserApi from "../api/browser.api";
import type { BrowserTabType } from "../types/browser.types";
import type { BrowserFilters, BrowserSortConfig } from "../types/browser.types";

const useInfiniteData = <TData>(
  tab: Exclude<BrowserTabType, "Overview">,
  backupId: string,
  fetchFn: (
    backupId: string,
    filters: BrowserFilters,
    sort: BrowserSortConfig,
    page: number,
  ) => Promise<TData>,
) => {
  const { tabState } = useBrowserStore();

  const { filters, sortConfig } = tabState[tab];

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
    staleTime: 5 * 60 * 1000,
  });
};

export const useBrowserManager = (backupId: string) => {
  const {
    activeTab,
    tabState,
    setActiveTab,
    setFilters,
    setSortConfig,
    resetTabState,
  } = useBrowserStore();

  const bookmarksQuery = useInfiniteData(
    "Bookmarks",
    backupId,
    browserApi.getBookmarks,
  );
  const historyQuery = useInfiniteData(
    "History",
    backupId,
    browserApi.getHistory,
  );
  const downloadsQuery = useInfiniteData(
    "Downloads",
    backupId,
    browserApi.getDownloads,
  );
  const searchesQuery = useInfiniteData(
    "Searches",
    backupId,
    browserApi.getSearches,
  );
  const tabsQuery = useInfiniteData("Tabs", backupId, browserApi.getTabs);

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

  const isOverviewTab = activeTab === "Overview";

  const queryMap = {
    Bookmarks: bookmarksQuery,
    History: historyQuery,
    Downloads: downloadsQuery,
    Searches: searchesQuery,
    Tabs: tabsQuery,
  };

  const currentListQuery = !isOverviewTab ? queryMap[activeTab] : null;

  const flattenedData = useMemo(() => {
    if (!currentListQuery || !currentListQuery.data) return [];
    return (
      currentListQuery.data.pages.flatMap((page) => (page as any).results) ?? []
    );
  }, [currentListQuery?.data]);

  return {
    activeTab,
    currentFilters: tabState[activeTab].filters,
    currentSortConfig: tabState[activeTab].sortConfig,

    setActiveTab,
    setFilters: (filters: Partial<BrowserFilters>) =>
      setFilters(activeTab, filters),
    setSortConfig: (sortConfig: BrowserSortConfig) =>
      setSortConfig(activeTab, sortConfig),
    resetCurrentTabState: () => resetTabState(activeTab),

    data: flattenedData,
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

    overviewData: overviewQuery.data,
    statisticsData: statsQuery.data,
  };
};
