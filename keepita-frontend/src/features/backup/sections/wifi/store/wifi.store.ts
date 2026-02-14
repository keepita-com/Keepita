import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  WiFiNetwork,
  WiFiFilters,
  WiFiSortConfig,
} from "../types/wifi.types";

interface WiFiStore {
  selectedWiFiNetwork: WiFiNetwork | null;
  isDetailsModalOpen: boolean;

  filters: WiFiFilters;
  searchQuery: string;
  sortConfig: WiFiSortConfig;

  setSelectedWiFiNetwork: (wifiNetwork: WiFiNetwork | null) => void;
  openDetailsModal: () => void;
  closeDetailsModal: () => void;
  setFilters: (filters: WiFiFilters) => void;
  setSearchQuery: (query: string) => void;
  setSortConfig: (config: WiFiSortConfig) => void;
  clearFilters: () => void;
  reset: () => void;
}

const initialState = {
  selectedWiFiNetwork: null,
  isDetailsModalOpen: false,
  filters: {},
  searchQuery: "",
  sortConfig: { field: "created_at" as const, direction: "desc" as const },
};

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
          "closeDetailsModal",
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
          "clearFilters",
        ),

      reset: () => set(initialState, false, "reset"),
    }),
    {
      name: "wifi-store",
    },
  ),
);
