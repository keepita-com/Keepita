import { DataProvider } from "../../../../../core/api/dataProvider";
import type {
  CallLogsApiResponse,
  GetCallLogsParams,
} from "../types/callLogs.types";
import { buildCallLogsQueryParams } from "../utils/callLogs.utils";

const RESOURCE = "dashboard";

const CALL_LOGS_API_ENDPOINTS = {
  LIST: (backupId: number | string) =>
    `${RESOURCE}/backups/${backupId}/call_logs/list/`,
} as const;

/**
 * Get call logs for a specific backup with optional filtering and pagination
 */
export const getCallLogs = async (
  backupId: number | string | undefined,
  params: Partial<GetCallLogsParams> = {}
): Promise<CallLogsApiResponse> => {
  if (!backupId) {
    throw new Error("Backup ID is required");
  }

  const numericBackupId =
    typeof backupId === "string" ? parseInt(backupId, 10) : backupId;

  if (isNaN(numericBackupId)) {
    throw new Error("Invalid backup ID");
  }

  console.log("CallLogs API: getCallLogs called", {
    backupId: numericBackupId,
    params,
  });

  const queryParams = buildCallLogsQueryParams(params);
  const endpoint = CALL_LOGS_API_ENDPOINTS.LIST(numericBackupId);

  console.log(
    "CallLogs API: Making request to",
    endpoint,
    "with params:",
    queryParams
  );

  try {
    const response = await DataProvider.get<CallLogsApiResponse>(endpoint, {
      params: queryParams,
    });
    console.log("CallLogs API: Response received", {
      status: "success",
      resultCount: response.data.result_count,
      totalResults: response.data.total_results,
    });
    return response.data;
  } catch (error) {
    console.error("CallLogs API: Error fetching call logs:", error);
    throw error;
  }
};