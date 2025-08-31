import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  WiFiNetwork,
  WiFiFilters,
  WiFiSortConfig,
} from "../types/wifi.types";

/**
 * WiFi store interface - Only client-side state
 */
interface WiFiStore {
  // Client-side UI state only
  selectedWiFiNetwork: WiFiNetwork | null;
  isDetailsModalOpen: boolean;

  // Filters and Search (client-side)
  filters: WiFiFilters;
  searchQuery: string;
  sortConfig: WiFiSortConfig;

  // Actions for client-side state only
  setSelectedWiFiNetwork: (wifiNetwork: WiFiNetwork | null) => void;
  openDetailsModal: () => void;
  closeDetailsModal: () => void;
  setFilters: (filters: WiFiFilters) => void;
  setSearchQuery: (query: string) => void;
  setSortConfig: (config: WiFiSortConfig) => void;
  clearFilters: () => void;
  reset: () => void;
}

/**
 * Initial state - Only client-side state
 */
const initialState = {
  selectedWiFiNetwork: null,
  isDetailsModalOpen: false,
  filters: {},
  searchQuery: "",
  sortConfig: { field: "created_at" as const, direction: "desc" as const },
};

/**
 * WiFi store implementation - Only client-side state management
 */
export const useWiFiStore = create<WiFiStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setSelectedWiFiNetwork: (selectedWiFiNetwork) =>
        set({ selectedWiFiNetwork }, false, "setSelectedWiFiNetwork"),

      openDetailsModal: () =>
        set({ isDetailsModalOpen: true }, false, "openDetailsModal"),

      closeDetailsModal: () =>
        set(
          {
            isDetailsModalOpen: false,
            selectedWiFiNetwork: null,
          },
          false,
          "closeDetailsModal"
        ),

      setFilters: (filters) => set({ filters }, false, "setFilters"),

      setSearchQuery: (searchQuery) =>
        set({ searchQuery }, false, "setSearchQuery"),

      setSortConfig: (sortConfig) =>
        set({ sortConfig }, false, "setSortConfig"),

      clearFilters: () =>
        set(
          {
            filters: {},
            searchQuery: "",
          },
          false,
          "clearFilters"
        ),

      reset: () => set(initialState, false, "reset"),
    }),
    {
      name: "wifi-store",
    }
  )
);
