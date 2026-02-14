import { create } from "zustand";
import type {
  BluetoothDevice,
  BluetoothFilters,
  BluetoothViewMode,
  BluetoothSortConfig,
} from "../types/bluetooth.types";

interface BluetoothStoreState {
  selectedDevice: BluetoothDevice | null;
  selectedDevices: number[];
  searchQuery: string;
  filters: BluetoothFilters;
  viewMode: BluetoothViewMode;
  sortConfig: BluetoothSortConfig;
}

interface BluetoothStoreActions {
  selectDevice: (device: BluetoothDevice | null) => void;
  selectMultipleDevices: (deviceIds: number[]) => void;
  toggleDeviceSelection: (deviceId: number) => void;
  clearSelection: () => void;
  selectAllDevices: (deviceIds: number[]) => void;

  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<BluetoothFilters>) => void;
  resetFilters: () => void;

  setViewMode: (mode: BluetoothViewMode) => void;
  setSortConfig: (config: BluetoothSortConfig) => void;

  reset: () => void;
}

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

export const useBluetoothStore = create<
  BluetoothStoreState & BluetoothStoreActions
>((set) => ({
  ...initialState,

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

  setViewMode: (viewMode: BluetoothViewMode) => {
    set({ viewMode });
  },

  setSortConfig: (sortConfig: BluetoothSortConfig) => {
    set({ sortConfig });
  },

  reset: () => {
    set(initialState);
  },
}));

export const bluetoothSelectors = {
  getSelectedDevicesFromList: (
    selectedDeviceIds: number[],
    allDevices: BluetoothDevice[],
  ) => {
    return allDevices.filter((device) => selectedDeviceIds.includes(device.id));
  },
};
