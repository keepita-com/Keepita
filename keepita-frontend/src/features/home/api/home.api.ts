import { DataProvider } from "../../../core/api/dataProvider";

import type { DashboardOverviewResponse } from "../types/home.types";

export const getDashboardOverview = async () => {
  const response = await DataProvider.get<DashboardOverviewResponse>(
    "dashboard/status/"
  );

  return response.data;
};
