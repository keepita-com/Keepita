import { DataProvider } from "../../../../../core/api/dataProvider";
import { buildQueryParams } from "../../../../../shared/utils/queryParams";
import type {
  HomescreenLayout,
  HomescreenListResponse,
  HomescreenQueryParams,
} from "../types/homescreen.types";

const RESOURCE = "dashboard/backups";

const HOMESCREEN_API_ENDPOINTS = {
  LAYOUTS: (backupId: string) => `${RESOURCE}/${backupId}/homescreen/layouts/`,
} as const;

export const getHomescreenLayouts = async (
  backupId: string,
  params: HomescreenQueryParams = {},
): Promise<HomescreenListResponse> => {
  const cleanParams = buildQueryParams(params);
  const queryString = new URLSearchParams(cleanParams).toString();
  const url = `${HOMESCREEN_API_ENDPOINTS.LAYOUTS(backupId)}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await DataProvider.get<HomescreenListResponse>(url);
  return response.data;
};

export const getHomescreenLayout = async (
  backupId: string,
  layoutId: string,
): Promise<HomescreenLayout> => {
  const url = `${HOMESCREEN_API_ENDPOINTS.LAYOUTS(backupId)}${layoutId}/`;
  const response = await DataProvider.get<HomescreenLayout>(url);
  return response.data;
};
