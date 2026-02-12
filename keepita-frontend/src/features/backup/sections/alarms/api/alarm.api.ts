import { DataProvider } from "../../../../../core/api/dataProvider";
import type { AlarmsApiResponse, GetAlarmsParams } from "../types/alarm.types";
import { buildAlarmsQueryParams } from "../utils/alarms.utils";

const RESOURCE = "dashboard";

const ALARM_API_ENDPOINTS = {
  LIST: (backupId: number) => `${RESOURCE}/backups/${backupId}/alarms/list/`,
} as const;

export const getAlarms = async (
  backupId: number | string | undefined,
  params: Partial<GetAlarmsParams> = {},
): Promise<AlarmsApiResponse> => {
  if (!backupId) {
    throw new Error("Backup ID is required");
  }

  const numericBackupId =
    typeof backupId === "string" ? parseInt(backupId, 10) : backupId;

  if (isNaN(numericBackupId)) {
    throw new Error("Invalid backup ID");
  }

  const queryParams = buildAlarmsQueryParams(params);
  const endpoint = ALARM_API_ENDPOINTS.LIST(numericBackupId);

  try {
    const response = await DataProvider.get<AlarmsApiResponse>(endpoint, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching alarms:", error);
    throw error;
  }
};
