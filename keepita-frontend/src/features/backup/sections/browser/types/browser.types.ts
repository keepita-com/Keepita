import type { ApiResponseList } from "../../../../../core/types/apiResponse";

//==============================
// CORE DOMAIN TYPES
//==============================

export type BrowserTabType =
  | "Overview"
  | "Bookmarks"
  | "History"
  | "Downloads"
  | "Searches"
  | "Tabs";

export interface Bookmark {
  id: number;
  title: string;
  url: string;
  created_at: string;
  updated_at: string;
  folder?: string;
  favicon?: string;
}

export interface HistoryEntry {
  id: number;
  title: string;
  url: string;
  last_visit_time: string;
  visit_count: number;
  hidden: boolean;
  source?: string;
  favicon?: string;
}

export interface DownloadItem {
  id: number;
  file_name: string;
  target_path: string;
  url: string;
  state: "COMPLETE" | "IN_PROGRESS" | "FAILED" | "CANCELLED";
  bytes_downloaded: number;
  total_bytes: number;
  download_time: string;
  mime_type: string;
}

export interface SearchQuery {
  id: number;
  search_term: string;
  search_time: string;
  search_engine: string;
  url: string;
}

export interface BrowserTab {
  id: number;
  title: string;
  url: string;
  last_accessed: string;
  is_pinned: boolean;
  is_incognito: boolean;
  favicon?: string;
}

export interface TopDomain {
  domain: string;
  visit_count: number;
}

export interface DownloadStats {
  total_downloads: number;
  total_size_mb: number;
  completed: number;
  failed: number;
  by_file_type: Record<string, number>;
}

export interface BrowserOverviewInterface {
  total_bookmarks: number;
  total_history: number;
  total_downloads: number;
  total_searches: number;
  total_tabs: number;
  recent_bookmarks: Bookmark[];
  recent_history: HistoryEntry[];
  recent_downloads: DownloadItem[];
}

export interface BrowserStatistics extends BrowserOverviewInterface {
  top_domains: TopDomain[];
  download_stats: DownloadStats;
}

//==============================
// API RESPONSE TYPES
//==============================

export type BookmarksResponse = ApiResponseList<Bookmark[]>;
export type HistoryResponse = ApiResponseList<HistoryEntry[]>;
export type DownloadsResponse = ApiResponseList<DownloadItem[]>;
export type SearchesResponse = ApiResponseList<SearchQuery[]>;
export type TabsResponse = ApiResponseList<BrowserTab[]>;
export type TopDomainsResponse = ApiResponseList<TopDomain[]>;

//==============================
// ZUSTAND STORE TYPES
//==============================

export interface BrowserFilters {
  // Only search functionality
  search?: string;
}

export interface BrowserSortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface BrowserTabState {
  filters: BrowserFilters;
  sortConfig: BrowserSortConfig;
}

export interface BrowserStoreState {
  activeTab: BrowserTabType;
  tabState: Record<BrowserTabType, BrowserTabState>;
}

export interface BrowserStoreActions {
  setActiveTab: (tab: BrowserTabType) => void;
  setFilters: (tab: BrowserTabType, filters: Partial<BrowserFilters>) => void;
  setSortConfig: (tab: BrowserTabType, sortConfig: BrowserSortConfig) => void;
  resetTabState: (tab: BrowserTabType) => void;
}
