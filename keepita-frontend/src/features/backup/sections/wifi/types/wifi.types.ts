import type { ApiResponseList } from "../../../../../core/types/apiResponse";

export type SecurityType =
  | "WPA_PSK"
  | "WPA2_PSK"
  | "NONE"
  | "WPA_EAP"
  | "WPA2_EAP";

export type ConnectionStatus = "Connected" | "Saved" | "Available" | "Failed";

export type FrequencyBand = "2.4GHz" | "5GHz" | "6GHz" | "Unknown";

export interface WiFiNetwork {
  id: number;
  ssid: string;
  security_type: SecurityType;
  security_display: string;
  password: string;
  hidden: boolean;
  frequency: number | null;
  frequency_display: string;
  last_connected: string | null;
  last_connected_display: string;
  is_saved: boolean;
  status_display: string;
  connection_status: ConnectionStatus;
  created_at: string;
  backup_model?: string;
  security_strength?: {
    level: string;
    color: string;
    score: number;
  };
}

export interface WiFiFilters {
  security_type?: SecurityType;
  hidden?: boolean;
  is_saved?: boolean;
  frequency_band?: FrequencyBand;
  last_connected_from?: string;
  last_connected_to?: string;
  created_from?: string;
  created_to?: string;
  search?: string;
}

export interface WiFiSortConfig {
  field: "created_at" | "last_connected" | "ssid" | "security_type";
  direction: "asc" | "desc";
}

export interface WiFiListResponse extends ApiResponseList<WiFiNetwork[]> {}

export interface WiFiQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  security_type?: SecurityType;
  hidden?: boolean;
  is_saved?: boolean;
  frequency_band?: FrequencyBand;
  last_connected_from?: string;
  last_connected_to?: string;
  created_from?: string;
  created_to?: string;
}
