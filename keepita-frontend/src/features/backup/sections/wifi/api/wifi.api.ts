import { DataProvider } from "../../../../../core/api/dataProvider";
import type {
  WiFiNetwork,
  WiFiListResponse,
  WiFiQueryParams,
} from "../types/wifi.types";
import { buildWifiQueryParams } from "../utils/wifi.utils";

const RESOURCE = "dashboard";

const WIFI_API_ENDPOINTS = {
  NETWORKS: (backupId: string) => `${RESOURCE}/backups/${backupId}/wifi/list/`,
  NETWORK_DETAIL: (backupId: string, wifiId: string) =>
    `${RESOURCE}/backups/${backupId}/wifi/list/${wifiId}/`,
};

/**
 * Get WiFi networks for a backup (function-based)
 */
export const getWiFiNetworks = async (
  backupId: string,
  params: Partial<WiFiQueryParams> = {}
): Promise<WiFiListResponse> => {
  if (!backupId) {
    throw new Error("Backup ID is required");
  }

  const numericBackupId = parseInt(backupId.toString(), 10);
  if (isNaN(numericBackupId)) {
    throw new Error("Invalid backup ID format");
  }

  const queryParams = buildWifiQueryParams(params);
  const endpoint = WIFI_API_ENDPOINTS.NETWORKS(backupId);

  try {
    const response = await DataProvider.get<WiFiListResponse>(endpoint, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching WiFi networks:", error);
    throw error;
  }
};

/**
 * Get a single WiFi network details (function-based)
 */
export const getWiFiNetwork = async (
  backupId: string,
  wifiId: string
): Promise<WiFiNetwork> => {
  if (!backupId || !wifiId) {
    throw new Error("Backup ID and WiFi ID are required");
  }

  const numericBackupId = parseInt(backupId.toString(), 10);
  const numericWifiId = parseInt(wifiId.toString(), 10);

  if (isNaN(numericBackupId) || isNaN(numericWifiId)) {
    throw new Error("Invalid backup ID or WiFi ID format");
  }

  const endpoint = WIFI_API_ENDPOINTS.NETWORK_DETAIL(backupId, wifiId);

  try {
    const response = await DataProvider.get<WiFiNetwork>(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching WiFi network details:", error);
    throw error;
  }
};
