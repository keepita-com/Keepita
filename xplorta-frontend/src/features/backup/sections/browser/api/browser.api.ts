import { DataProvider } from "../../../../../core/api/dataProvider";
import type {
  BookmarksResponse,
  HistoryResponse,
  DownloadsResponse,
  SearchesResponse,
  TabsResponse,
  DownloadStats,
  BrowserStatistics,
  BrowserOverviewInterface,
} from "../types/browser.types";
import type { BrowserFilters, BrowserSortConfig } from "../types/browser.types";

const RESOURCE_ROOT = (backupId: string | number) =>
  `dashboard/backups/${backupId}/browser`;

const buildParams = (
  filters?: BrowserFilters,
  sortConfig?: BrowserSortConfig,
  page?: number
) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }

  if (sortConfig) {
    const ordering =
      sortConfig.direction === "desc"
        ? `-${sortConfig.field}`
        : sortConfig.field;
    params.append("ordering", ordering);
  }
  return params;
};

// === API Functions ===

// 1. Bookmarks
export const getBookmarks = async (
  backupId: string | number,
  filters?: BrowserFilters,
  sortConfig?: BrowserSortConfig,
  page: number = 1
): Promise<BookmarksResponse> => {
  const endpoint = `${RESOURCE_ROOT(backupId)}/bookmarks/`;
  const params = buildParams(filters, sortConfig, page);
  return (await DataProvider.get<BookmarksResponse>(`${endpoint}?${params}`))
    .data;
};

// 2. History
export const getHistory = async (
  backupId: string | number,
  filters?: BrowserFilters,
  sortConfig?: BrowserSortConfig,
  page: number = 1
): Promise<HistoryResponse> => {
  const endpoint = `${RESOURCE_ROOT(backupId)}/history/`;
  const params = buildParams(filters, sortConfig, page);
  return (await DataProvider.get<HistoryResponse>(`${endpoint}?${params}`))
    .data;
};

// 3. Downloads
export const getDownloads = async (
  backupId: string | number,
  filters?: BrowserFilters,
  sortConfig?: BrowserSortConfig,
  page: number = 1
): Promise<DownloadsResponse> => {
  const endpoint = `${RESOURCE_ROOT(backupId)}/downloads/`;
  const params = buildParams(filters, sortConfig, page);
  return (await DataProvider.get<DownloadsResponse>(`${endpoint}?${params}`))
    .data;
};

export const getDownloadStats = async (
  backupId: string | number
): Promise<DownloadStats> => {
  const endpoint = `${RESOURCE_ROOT(backupId)}/downloads/statistics/`;
  return (await DataProvider.get<DownloadStats>(endpoint)).data;
};

// 4. Searches
export const getSearches = async (
  backupId: string | number,
  filters?: BrowserFilters,
  sortConfig?: BrowserSortConfig,
  page: number = 1
): Promise<SearchesResponse> => {
  const endpoint = `${RESOURCE_ROOT(backupId)}/searches/`;
  const params = buildParams(filters, sortConfig, page);
  return (await DataProvider.get<SearchesResponse>(`${endpoint}?${params}`))
    .data;
};

// 5. Tabs
export const getTabs = async (
  backupId: string | number,
  filters?: BrowserFilters,
  sortConfig?: BrowserSortConfig,
  page: number = 1
): Promise<TabsResponse> => {
  const endpoint = `${RESOURCE_ROOT(backupId)}/tabs/`;
  const params = buildParams(filters, sortConfig, page);
  return (await DataProvider.get<TabsResponse>(`${endpoint}?${params}`)).data;
};

// 6. Overview
export const getBrowserOverview = async (
  backupId: string | number
): Promise<BrowserOverviewInterface> => {
  const endpoint = `${RESOURCE_ROOT(backupId)}/overview/`;
  return (await DataProvider.get<BrowserOverviewInterface>(endpoint)).data;
};

export const getBrowserStatistics = async (
  backupId: string | number
): Promise<BrowserStatistics> => {
  const endpoint = `${RESOURCE_ROOT(backupId)}/overview/statistics/`;
  return (await DataProvider.get<BrowserStatistics>(endpoint)).data;
};
