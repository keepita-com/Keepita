import type { ApiResponseList } from "../../../../../core/types/apiResponse";

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

export interface BluetoothDevicesResponse extends ApiResponseList<
  BluetoothDevice[]
> {}

export interface GetBluetoothDevicesParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;

  name?: string;
  address?: string;
  device_class?: number;
  appearance?: number;
  bond_state?: number;
  link_type?: number;

  last_connected_after?: string;
  last_connected_before?: string;
  created_after?: string;
  created_before?: string;
}

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

export interface BluetoothSortConfig {
  ordering?: string;
}

export type BluetoothViewMode = "list" | "grid";

export type BluetoothDeviceType =
  | "audio"
  | "input"
  | "phone"
  | "computer"
  | "tv"
  | "peripheral"
  | "unknown";

export type BondState = 0 | 1 | 2;
export const BondState = {
  NONE: 0 as BondState,
  BONDING: 1 as BondState,
  BONDED: 2 as BondState,
};

export type LinkType = 1 | 2;
export const LINK_TYPE = {
  CLASSIC: 1 as LinkType,
  LOW_ENERGY: 2 as LinkType,
};

export interface BluetoothStats {
  total: number;
  paired: number;
  audioDevices: number;
  recentlyConnected: number;
}

export interface BluetoothDeviceActions {
  onPair?: (device: BluetoothDevice) => void;
  onUnpair?: (device: BluetoothDevice) => void;
  onConnect?: (device: BluetoothDevice) => void;
  onDisconnect?: (device: BluetoothDevice) => void;
  onDetails?: (device: BluetoothDevice) => void;
  onDelete?: (device: BluetoothDevice) => void;
}

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

export interface GroupedBluetoothDevices {
  [deviceType: string]: BluetoothDevice[];
}

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
