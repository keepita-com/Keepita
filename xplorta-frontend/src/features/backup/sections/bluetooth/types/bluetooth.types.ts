import type { ApiResponseList } from "../../../../../core/types/apiResponse";

// Bluetooth domain types following SOLID principles
export interface BluetoothDevice {
  id: number;
  backup: number;
  name: string;
  address: string;
  device_class: number;
  appearance: number;
  last_connected: string;
  bond_state: number;
  link_type: number;
  uuids: string;
  manufacturer_data: string | null;
  created_at: string;
}

// API response structure
export interface BluetoothDevicesResponse
  extends ApiResponseList<BluetoothDevice[]> {}

// API request parameters
export interface GetBluetoothDevicesParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  // Basic filters
  name?: string;
  address?: string;
  device_class?: number;
  appearance?: number;
  bond_state?: number;
  link_type?: number;
  // Date filters
  last_connected_after?: string;
  last_connected_before?: string;
  created_after?: string;
  created_before?: string;
}

// Bluetooth device filtering options
export interface BluetoothFilters {
  search?: string;
  name?: string;
  address?: string;
  device_class?: number;
  device_type?: BluetoothDeviceType;
  appearance?: number;
  bond_state?: number;
  link_type?: number;
  date_from?: string;
  date_to?: string;
  is_paired?: boolean;
}

// Bluetooth device sorting configuration
export interface BluetoothSortConfig {
  ordering?: string; // e.g., "-last_connected", "name", "device_class"
}

// Bluetooth device view modes
export type BluetoothViewMode = "list" | "grid";

// Bluetooth device types based on device_class
export type BluetoothDeviceType =
  | "audio"
  | "input"
  | "phone"
  | "computer"
  | "tv"
  | "peripheral"
  | "unknown";

// Bond state as union type and constant object
export type BondState = 0 | 1 | 2;
export const BondState = {
  NONE: 0 as BondState,
  BONDING: 1 as BondState,
  BONDED: 2 as BondState,
};

// Link type as union type
export type LinkType = 1 | 2;
export const LINK_TYPE = {
  CLASSIC: 1 as LinkType,
  LOW_ENERGY: 2 as LinkType,
};

// Bluetooth device statistics
export interface BluetoothStats {
  total: number;
  paired: number;
  audioDevices: number;
  recentlyConnected: number;
}

// Bluetooth device actions
export interface BluetoothDeviceActions {
  onPair?: (device: BluetoothDevice) => void;
  onUnpair?: (device: BluetoothDevice) => void;
  onConnect?: (device: BluetoothDevice) => void;
  onDisconnect?: (device: BluetoothDevice) => void;
  onDetails?: (device: BluetoothDevice) => void;
  onDelete?: (device: BluetoothDevice) => void;
}

// Bluetooth device list props
export interface BluetoothDeviceListProps {
  devices: BluetoothDevice[];
  isLoading?: boolean;
  viewMode?: BluetoothViewMode;
  actions?: BluetoothDeviceActions;
  selectedDevices?: number[];
  onDeviceSelect?: (deviceId: number) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

// Grouped bluetooth devices
export interface GroupedBluetoothDevices {
  [deviceType: string]: BluetoothDevice[];
}

// Bluetooth device state
export interface BluetoothState {
  devices: BluetoothDevice[];
  stats: BluetoothStats;
  isLoading: boolean;
  selectedDevice: BluetoothDevice | null;
  selectedDevices: number[];
  currentBackupId: string | number | null;
  searchQuery: string;
  filters: BluetoothFilters;
  viewMode: BluetoothViewMode;
  sortConfig: BluetoothSortConfig;
}
