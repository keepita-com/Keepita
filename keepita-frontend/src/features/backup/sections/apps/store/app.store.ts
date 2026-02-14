import { create } from "zustand";
import type { AppViewMode, AppSortConfig, App } from "../types/app.types";

interface AppStoreState {
  selectedApp: App | null;
  selectedApps: string[];
  viewMode: AppViewMode;

  searchQuery: string;
  sortConfig: AppSortConfig;

  currentBackupId: string | number | null;
}

interface AppStoreActions {
  selectApp: (app: App | null) => void;
  selectMultipleApps: (packageNames: string[]) => void;
  toggleAppSelection: (packageName: string) => void;
  clearSelection: () => void;
  selectAllApps: (apps: App[]) => void;

  setSearchQuery: (query: string) => void;
  resetSearch: () => void;

  setViewMode: (mode: AppViewMode) => void;
  setSortConfig: (config: AppSortConfig) => void;

  setCurrentBackupId: (backupId: string | number | null) => void;

  reset: () => void;
}

type AppStore = AppStoreState & AppStoreActions;

const initialState: AppStoreState = {
  selectedApp: null,
  selectedApps: [],
  viewMode: "list",
  searchQuery: "",
  sortConfig: {
    field: "apk_name",
    direction: "asc",
  },
  currentBackupId: null,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  selectApp: (app) => {
    set({ selectedApp: app });
  },

  selectMultipleApps: (packageNames) => {
    set({ selectedApps: packageNames });
  },

  toggleAppSelection: (packageName) => {
    set((state) => ({
      selectedApps: state.selectedApps.includes(packageName)
        ? state.selectedApps.filter((name) => name !== packageName)
        : [...state.selectedApps, packageName],
    }));
  },

  clearSelection: () => {
    set({ selectedApp: null, selectedApps: [] });
  },

  selectAllApps: (apps) => {
    const packageNames = apps.map(
      (app) => app.apk_name || app.id?.toString() || "",
    );
    set({ selectedApps: packageNames });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  resetSearch: () => {
    set({
      searchQuery: "",
    });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setSortConfig: (config) => {
    set({ sortConfig: config });
  },

  setCurrentBackupId: (backupId) => {
    set({ currentBackupId: backupId });
  },

  reset: () => {
    set(initialState);
  },
}));
