import { DataProvider } from "../../../../../core/api/dataProvider";
import type { MyFilesResponse, GetMyFilesParams } from "../types/myFiles.types";
import { buildMyFilesQueryParams } from "../utils/myFiles.utils";

const RESOURCE = "dashboard";

const MY_FILES_API_ENDPOINTS = {
  LIST: (backupId: string) => `${RESOURCE}/backups/${backupId}/files/`,
} as const;

/**
 * Get files for a specific backup (function-based)
 */
export const getMyFiles = async (
  backupId: string | number,
  params: Partial<GetMyFilesParams> = {}
): Promise<MyFilesResponse> => {
  if (!backupId) {
    throw new Error("Backup ID is required");
  }

  const numericBackupId = parseInt(backupId.toString(), 10);
  if (isNaN(numericBackupId)) {
    throw new Error("Invalid backup ID format");
  }

  const queryParams = buildMyFilesQueryParams(params);
  const endpoint = MY_FILES_API_ENDPOINTS.LIST(backupId.toString());

  try {
    const response = await DataProvider.get<MyFilesResponse>(endpoint, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching my files:", error);
    throw error;
  }
};
