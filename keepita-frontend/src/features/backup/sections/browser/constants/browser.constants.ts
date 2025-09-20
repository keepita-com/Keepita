import {
  Bookmark,
  Clock,
  Download,
  Search,
  TabletSmartphone,
  PieChart,
} from "lucide-react";
import type { BrowserTabType } from "../types/browser.types";

export const BROWSER_TABS: {
  key: BrowserTabType;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "Overview", label: "Overview", icon: PieChart },
  { key: "Bookmarks", label: "Bookmarks", icon: Bookmark },
  { key: "History", label: "History", icon: Clock },
  { key: "Downloads", label: "Downloads", icon: Download },
  { key: "Searches", label: "Searches", icon: Search },
  { key: "Tabs", label: "Open Tabs", icon: TabletSmartphone },
];

export const BOOKMARK_SORT_OPTIONS = [
  { value: "-created_at", label: "Date Added (Newest)" },
  { value: "created_at", label: "Date Added (Oldest)" },
  { value: "title", label: "Title (A-Z)" },
  { value: "-title", label: "Title (Z-A)" },
  { value: "updated_at", label: "Last Updated" },
];

export const HISTORY_SORT_OPTIONS = [
  { value: "-last_visit_time", label: "Last Visited (Most Recent)" },
  { value: "last_visit_time", label: "Last Visited (Oldest)" },
  { value: "-visit_count", label: "Most Visited" },
  { value: "visit_count", label: "Least Visited" },
  { value: "title", label: "Title (A-Z)" },
  { value: "-title", label: "Title (Z-A)" },
];

export const DOWNLOAD_SORT_OPTIONS = [
  { value: "-download_time", label: "Download Date (Newest)" },
  { value: "download_time", label: "Download Date (Oldest)" },
  { value: "-bytes_downloaded", label: "Size (Largest First)" },
  { value: "bytes_downloaded", label: "Size (Smallest First)" },
  { value: "file_name", label: "File Name (A-Z)" },
  { value: "-file_name", label: "File Name (Z-A)" },
];

export const SEARCH_SORT_OPTIONS = [
  { value: "-search_time", label: "Search Date (Newest)" },
  { value: "search_time", label: "Search Date (Oldest)" },
  { value: "search_term", label: "Search Term (A-Z)" },
  { value: "-search_term", label: "Search Term (Z-A)" },
];

export const TAB_SORT_OPTIONS = [
  { value: "-last_accessed", label: "Last Accessed (Most Recent)" },
  { value: "last_accessed", label: "Last Accessed (Oldest)" },
  { value: "title", label: "Title (A-Z)" },
  { value: "-title", label: "Title (Z-A)" },
];

export const BROWSER_QUERY_KEYS = {
  overview: "browserOverview",
  statistics: "browserStatistics",
  bookmarks: "browserBookmarks",
  history: "browserHistory",
  topDomains: "browserTopDomains",
  downloads: "browserDownloads",
  downloadStats: "browserDownloadStats",
  searches: "browserSearches",
  popularTerms: "browserPopularTerms",
  tabs: "browserTabs",
};
