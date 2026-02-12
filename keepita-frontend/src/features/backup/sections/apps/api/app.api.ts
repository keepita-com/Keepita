import { DataProvider } from "../../../../../core/api/dataProvider";
import {
  buildAppQueryParams,
  buildAppPermissionsQueryParams,
} from "../utils/app.utils";
import type {
  AppPermissionsResponse,
  AppsResponse,
  GetAppParams,
  GetAppPermissionsParams,
} from "../types/app.types";

const RESOURCE = "dashboard";

export const APP_API_ENDPOINTS = {
  APPS: (backupId: string | number) =>
    `${RESOURCE}/backups/${backupId}/apps/list`,
  APP_PERMISSIONS: (backupId: string | number, appId: string | number) =>
    `${RESOURCE}/backups/${backupId}/apps/list/${appId}/permissions/`,
} as const;

const handleApiError = (error: unknown, operation: string): Error => {
  if (error && typeof error === "object" && "message" in error) {
    return new Error(error.message as string);
  } else if (error instanceof Error) {
    return error;
  } else {
    return new Error(
      `An error occurred while ${operation}. Please try again later.`,
    );
  }
};

export const getApps = async (
  backupId: string | number,
  params: GetAppParams = {},
): Promise<AppsResponse> => {
  try {
    const queryParams = buildAppQueryParams(params);

    console.log("App API Request:", {
      endpoint: APP_API_ENDPOINTS.APPS(backupId),
      params: queryParams,
    });

    const response = await DataProvider.get<AppsResponse>(
      APP_API_ENDPOINTS.APPS(backupId),
      {
        params: queryParams,
      },
    );

    console.log("App API Response:", {
      totalResults: response.data.total_results,
      currentPage: response.data.current_page,
      hasNext: response.data.has_next,
      resultCount: response.data.result_count,
    });

    return response.data;
  } catch (error) {
    console.error("App API Error:", error);
    throw handleApiError(error, "fetching apps");
  }
};

export const getAppPermissions = async (
  backupId: string | number,
  appId: string | number,
  params: GetAppPermissionsParams = {},
): Promise<AppPermissionsResponse> => {
  try {
    const queryParams = buildAppPermissionsQueryParams(params);

    const response = await DataProvider.get<AppPermissionsResponse>(
      APP_API_ENDPOINTS.APP_PERMISSIONS(backupId, appId),
      {
        params: queryParams,
      },
    );

    return response.data;
  } catch (error) {
    throw handleApiError(error, "fetching app permissions");
  }
};

export const searchApps = async (
  backupId: string | number,
  searchQuery: string,
  params?: Omit<GetAppParams, "search">,
): Promise<AppsResponse> => {
  return getApps(backupId, { ...params, search: searchQuery });
};

export const getSystemApps = async (
  backupId: string | number,
  params?: Omit<GetAppParams, "is_system">,
): Promise<AppsResponse> => {
  return getApps(backupId, { ...params, is_system: true });
};

export const getUserApps = async (
  backupId: string | number,
  params?: Omit<GetAppParams, "is_system">,
): Promise<AppsResponse> => {
  return getApps(backupId, { ...params, is_system: false });
};
