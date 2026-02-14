import { DataProvider } from "../../../../../core/api/dataProvider";
import type {
  BluetoothDevicesResponse,
  GetBluetoothDevicesParams,
} from "../types/bluetooth.types";
import { buildBluetoothQueryParams } from "../utils/bluetooth.utils";

const RESOURCE = "dashboard";

const BLUETOOTH_API_ENDPOINTS = {
  DEVICES: (backupId: number) =>
    `${RESOURCE}/backups/${backupId}/bluetooth/devices/`,
} as const;

export const getBluetoothDevices = async (
  backupId: number | string | undefined,
  params: Partial<GetBluetoothDevicesParams> = {},
): Promise<BluetoothDevicesResponse> => {
  if (!backupId) {
    throw new Error("Backup ID is required");
  }

  const numericBackupId =
    typeof backupId === "string" ? parseInt(backupId, 10) : backupId;

  if (isNaN(numericBackupId)) {
    throw new Error("Invalid backup ID");
  }

  const queryParams = buildBluetoothQueryParams(params);
  const endpoint = BLUETOOTH_API_ENDPOINTS.DEVICES(numericBackupId);

  try {
    const response = await DataProvider.get<BluetoothDevicesResponse>(
      endpoint,
      {
        params: queryParams,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching bluetooth devices:", error);
    throw error;
  }
};

export const exportBluetoothDevices = async (
  backupId: number | string | undefined,
  params: Partial<GetBluetoothDevicesParams> = {},
): Promise<Blob> => {
  if (!backupId) {
    throw new Error("Backup ID is required");
  }

  const numericBackupId =
    typeof backupId === "string" ? parseInt(backupId, 10) : backupId;

  if (isNaN(numericBackupId)) {
    throw new Error("Invalid backup ID");
  }

  const exportParams = { ...params };
  const queryParams = buildBluetoothQueryParams(exportParams);
  const endpoint = BLUETOOTH_API_ENDPOINTS.DEVICES(numericBackupId);

  try {
    return await DataProvider.download(endpoint, {
      params: { ...queryParams, format: "csv" },
    });
  } catch (error) {
    console.error("Error exporting bluetooth devices:", error);
    throw error;
  }
};

export const bluetoothApi = {
  getDevices: getBluetoothDevices,
} as const;

export const useBluetoothApi = () => bluetoothApi;
