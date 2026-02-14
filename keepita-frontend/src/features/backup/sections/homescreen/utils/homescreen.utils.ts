import { buildQueryParams } from "../../../../../shared/utils/queryParams";
import type { HomescreenQueryParams } from "../types/homescreen.types";

export const buildHomescreenQueryParams = (
  params: Partial<HomescreenQueryParams>,
): Record<string, any> => {
  return buildQueryParams(params);
};

export const buildHomescreenQueryParamsWithDefaults = (
  params: Partial<HomescreenQueryParams>,
): Record<string, any> => {
  const defaults = {
    page: 1,
    page_size: 10,
    ordering: "-created_at",
  };

  return buildQueryParams({ ...defaults, ...params });
};
