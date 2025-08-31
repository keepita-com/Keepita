import { create } from "zustand";
import type { AppViewMode, AppSortConfig, App } from "../types/app.types";

/**
 * App store state interface - CLIENT-SIDE STATE ONLY
 * Server state (apps data, loading, errors) is managed by React Query
 */
interface AppStoreState {
  // UI State
  selectedApp: App | null;
  selectedApps: string[];
  viewMode: AppViewMode;

  // Search and Sort State (client-side)
  searchQuery: string;
  sortConfig: AppSortConfig;

  // Current context
  currentBackupId: string | number | null;
}

/**
 * App store actions interface - CLIENT-SIDE ACTIONS ONLY
 */
interface AppStoreActions {
  // App selection (UI state)
  selectApp: (app: App | null) => void;
  selectMultipleApps: (packageNames: string[]) => void;
  toggleAppSelection: (packageName: string) => void;
  clearSelection: () => void;
  selectAllApps: (apps: App[]) => void; // Takes apps from React Query

  // Search and sort (client state)
  setSearchQuery: (query: string) => void;
  resetSearch: () => void;

  // View settings (UI state)
  setViewMode: (mode: AppViewMode) => void;
  setSortConfig: (config: AppSortConfig) => void;

  // Context management
  setCurrentBackupId: (backupId: string | number | null) => void;

  // Utility actions
  reset: () => void;
}

type AppStore = AppStoreState & AppStoreActions;

/**
 * Initial state - CLIENT-SIDE ONLY
 */
const initialState: AppStoreState = {
  selectedApp: null,
  selectedApps: [],
  viewMode: "list",
  searchQuery: "",
  sortConfig: {
    field: "name",
    direction: "asc",
  },
  currentBackupId: null,
};

/**
 * Zustand store for app client-side state management
 */
export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  // App selection actions
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
      (app) => app.apk_name || app.id?.toString() || ""
    );
    set({ selectedApps: packageNames });
  },

  // Search and sort actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  resetSearch: () => {
    set({
      searchQuery: "",
    });
  },

  // View settings actions
  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setSortConfig: (config) => {
    set({ sortConfig: config });
  },

  // Context management
  setCurrentBackupId: (backupId) => {
    set({ currentBackupId: backupId });
  },

  // Utility actions
  reset: () => {
    set(initialState);
  },
}));
