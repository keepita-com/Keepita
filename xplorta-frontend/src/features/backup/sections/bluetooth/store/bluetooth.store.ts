import { create } from "zustand";
import type {
  BluetoothDevice,
  BluetoothFilters,
  BluetoothViewMode,
  BluetoothSortConfig,
} from "../types/bluetooth.types";

/**
 * Bluetooth store state interface - Only client-side state
 */
interface BluetoothStoreState {
  // Client-side UI state only
  selectedDevice: BluetoothDevice | null;
  selectedDevices: number[];
  searchQuery: string;
  filters: BluetoothFilters;
  viewMode: BluetoothViewMode;
  sortConfig: BluetoothSortConfig;
}

/**
 * Bluetooth store actions interface - Only client-side actions
 */
interface BluetoothStoreActions {
  // Device selection (client-side only)
  selectDevice: (device: BluetoothDevice | null) => void;
  selectMultipleDevices: (deviceIds: number[]) => void;
  toggleDeviceSelection: (deviceId: number) => void;
  clearSelection: () => void;
  selectAllDevices: (deviceIds: number[]) => void;

  // Search and filters (client-side only)
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<BluetoothFilters>) => void;
  resetFilters: () => void;

  // View settings (client-side only)
  setViewMode: (mode: BluetoothViewMode) => void;
  setSortConfig: (config: BluetoothSortConfig) => void;

  // Utility actions
  reset: () => void;
}

/**
 * Initial state - Only client-side state
 */
const initialState: BluetoothStoreState = {
  selectedDevice: null,
  selectedDevices: [],
  searchQuery: "",
  filters: {},
  viewMode: "list",
  sortConfig: {
    ordering: "-last_connected",
  },
};

/**
 * Bluetooth store implementation - Only client-side state management
 */
export const useBluetoothStore = create<
  BluetoothStoreState & BluetoothStoreActions
>((set) => ({
  ...initialState,

  // Device selection (client-side only)
  selectDevice: (selectedDevice: BluetoothDevice | null) => {
    set({ selectedDevice });
  },

  selectMultipleDevices: (selectedDevices: number[]) => {
    set({ selectedDevices });
  },

  toggleDeviceSelection: (deviceId: number) => {
    set((state) => ({
      selectedDevices: state.selectedDevices.includes(deviceId)
        ? state.selectedDevices.filter((id) => id !== deviceId)
        : [...state.selectedDevices, deviceId],
    }));
  },

  clearSelection: () => {
    set({ selectedDevices: [], selectedDevice: null });
  },

  selectAllDevices: (deviceIds: number[]) => {
    set({ selectedDevices: deviceIds });
  },

  // Search and filters (client-side only)
  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
  },

  setFilters: (newFilters: Partial<BluetoothFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  resetFilters: () => {
    set({
      searchQuery: "",
      filters: {},
    });
  },

  // View settings (client-side only)
  setViewMode: (viewMode: BluetoothViewMode) => {
    set({ viewMode });
  },

  setSortConfig: (sortConfig: BluetoothSortConfig) => {
    set({ sortConfig });
  },

  // Utility actions
  reset: () => {
    set(initialState);
  },
}));

/**
 * Selectors for computed client-side state
 */
export const bluetoothSelectors = {
  getSelectedDevicesFromList: (
    selectedDeviceIds: number[],
    allDevices: BluetoothDevice[]
  ) => {
    return allDevices.filter((device) => selectedDeviceIds.includes(device.id));
  },
};
