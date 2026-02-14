import { DataProvider } from "../../../core/api/dataProvider";
import type { ApiResponseList } from "../../../core/types/apiResponse";
import type { BackupItem } from "../store/backup.store";
import type {
  BackupMediaResponse,
  BackupsStatsResponse,
} from "../types/backup.types";

const RESOURCE = "dashboard";

const DASHBOARD_API_ENDPOINTS = {
  BACKUPS: `${RESOURCE}/backups/`,
  BACKUP_PROGRESS: `${RESOURCE}/backups/progress/`,
};

export interface BackupFilters {
  search?: string;
  name?: string;
  model_name?: string;
  status?: "completed" | "processing" | "failed";
  created_after?: string;
  created_before?: string;
  updated_at_after?: string;
  updated_at_before?: string;
}

export interface BackupSortConfig {
  ordering?: string;
}

export interface GetBackupsParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: "completed" | "processing" | "failed";
  created_after?: string;
  created_before?: string;
}

export interface CreateBackupParams {
  name: string;
  backup_file: File;
}

export interface CreateBackupWithProgressParams {
  name: string;
  backup_file: File;
  onUploadProgress?: (progressEvent: any) => void;
  device_brand: string;
  ios_password?: string;
}

export interface UpdateBackupParams {
  name?: string;
  status?: "completed" | "processing" | "failed";
}

export interface CreateBackupResponse {
  backup_id: number;
  log_id: string;
}

export interface StepData {
  name: string;
  status: "processing" | "completed" | "failed";
  timestamp: string;
  description: string;
  progress_percent: number;
}

export interface BackupProgressResponse {
  id: string;
  backup: number;
  status: "processing" | "completed" | "failed";
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  steps_data: {
    [key: string]: StepData;
  } | null;
  created_at: string;
  updated_at: string;
}

export const useBackupApi = () => {
  const getBackupProgress = async (
    logId: string,
  ): Promise<BackupProgressResponse> => {
    try {
      const response = await DataProvider.get<BackupProgressResponse>(
        `${DASHBOARD_API_ENDPOINTS.BACKUP_PROGRESS}${logId}/`,
      );

      const responseData = response.data;
      return {
        ...responseData,
        steps_data: responseData.steps_data || {},
      };
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw new Error(error.message as string);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          "An error occurred while fetching backup progress. Please try again later.",
        );
      }
    }
  };

  const getBackups = async (params: GetBackupsParams = {}) => {
    try {
      const queryParams: Record<string, any> = {
        page: params.page || 1,
        page_size: params.page_size || 6,
      };

      if (params.search) {
        queryParams.search = params.search;
      }

      if (params.ordering) {
        queryParams.ordering = params.ordering;
      }

      if (params.status) {
        queryParams.status = params.status;
      }

      if (params.created_after) {
        queryParams.created_after = params.created_after;
      }
      if (params.created_before) {
        queryParams.created_before = params.created_before;
      }

      const response = await DataProvider.get<ApiResponseList<BackupItem[]>>(
        DASHBOARD_API_ENDPOINTS.BACKUPS,
        {
          params: queryParams,
        },
      );

      return response.data;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw new Error(error.message as string);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          "An error occurred while fetching the backups list. Please try again later.",
        );
      }
    }
  };

  const getBackup = async (id: string) => {
    try {
      const response = await DataProvider.get<BackupItem>(
        `${DASHBOARD_API_ENDPOINTS.BACKUPS}${id}/`,
      );
      return response.data;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw new Error(error.message as string);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          "An error occurred while fetching the backup details. Please try again later.",
        );
      }
    }
  };

  const createBackup = async (params: FormData) => {
    try {
      const response = await DataProvider.post<CreateBackupResponse>(
        DASHBOARD_API_ENDPOINTS.BACKUPS,
        params,
      );
      return response.data;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw new Error(error.message as string);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          "An error occurred while creating the backup. Please try again later.",
        );
      }
    }
  };

  const createBackupWithProgress = async (
    params: CreateBackupWithProgressParams,
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", params.name);
      formData.append("backup_file", params.backup_file);
      formData.append("device_brand", params.device_brand);
      if (params.ios_password) {
        formData.append("password", params.ios_password);
      }

      const response = await DataProvider.post<CreateBackupResponse>(
        DASHBOARD_API_ENDPOINTS.BACKUPS,
        formData,
        {
          onUploadProgress: params.onUploadProgress,
        },
      );
      return response.data;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw new Error(error.message as string);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          "An error occurred while creating the backup. Please try again later.",
        );
      }
    }
  };

  const updateBackup = async (id: string, params: UpdateBackupParams) => {
    try {
      const response = await DataProvider.patch<{ data: BackupItem }>(
        `${DASHBOARD_API_ENDPOINTS.BACKUPS}${id}/`,
        params,
      );
      return response.data;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw new Error(error.message as string);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          "An error occurred while updating the backup. Please try again later.",
        );
      }
    }
  };

  const deleteBackup = async (id: string) => {
    try {
      const response = await DataProvider.delete(
        `${DASHBOARD_API_ENDPOINTS.BACKUPS}${id}/`,
      );
      return response.data;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw new Error(error.message as string);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          "An error occurred while deleting the backup. Please try again later.",
        );
      }
    }
  };

  return {
    getBackupProgress,
    getBackups,
    getBackup,
    createBackup,
    createBackupWithProgress,
    updateBackup,
    deleteBackup,
  };
};

export const getBackupsStats = async () => {
  const response = await DataProvider.get<BackupsStatsResponse>(
    "dashboard/backups/statistics",
  );

  return response.data;
};

export const getBackupMedia = async (fileId: string | number) => {
  const response = await DataProvider.get<BackupMediaResponse>(
    `dashboard/files/${fileId}/download/`,
  );

  return response.data;
};
