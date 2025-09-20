import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  BrowserSortConfig,
  BrowserStoreActions,
  BrowserStoreState,
  BrowserTabType,
} from "../types/browser.types";

const initialSortConfig = (tab: BrowserTabType): BrowserSortConfig => {
  switch (tab) {
    case "Bookmarks":
      return { field: "created_at", direction: "desc" };
    case "History":
      return { field: "last_visit_time", direction: "desc" };
    case "Downloads":
      return { field: "download_time", direction: "desc" };
    case "Searches":
      return { field: "search_time", direction: "desc" };
    case "Tabs":
      return { field: "last_accessed", direction: "desc" };
    default:
      return { field: "", direction: "desc" };
  }
};

const initialTabState = (tab: BrowserTabType) => ({
  filters: {},
  sortConfig: initialSortConfig(tab),
});

const initialState: BrowserStoreState = {
  activeTab: "Overview",
  tabState: {
    Overview: initialTabState("Overview"),
    Bookmarks: initialTabState("Bookmarks"),
    History: initialTabState("History"),
    Downloads: initialTabState("Downloads"),
    Searches: initialTabState("Searches"),
    Tabs: initialTabState("Tabs"),
  },
};

export const useBrowserStore = create<
  BrowserStoreState & BrowserStoreActions
>()(
  devtools(
    (set) => ({
      ...initialState,
      setActiveTab: (tab) => set({ activeTab: tab }, false, "setActiveTab"),
      setFilters: (tab, filters) =>
        set(
          (state) => ({
            tabState: {
              ...state.tabState,
              [tab]: {
                ...state.tabState[tab],
                filters: { ...state.tabState[tab].filters, ...filters },
              },
            },
          }),
          false,
          `setFiltersFor_${tab}`
        ),
      setSortConfig: (tab, sortConfig) =>
        set(
          (state) => ({
            tabState: {
              ...state.tabState,
              [tab]: { ...state.tabState[tab], sortConfig },
            },
          }),
          false,
          `setSortConfigFor_${tab}`
        ),
      resetTabState: (tab) =>
        set(
          (state) => ({
            tabState: {
              ...state.tabState,
              [tab]: initialTabState(tab),
            },
          }),
          false,
          `resetTabStateFor_${tab}`
        ),
    }),
    { name: "browser-store" }
  )
);
