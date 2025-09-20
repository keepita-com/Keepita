import { useQuery } from "@tanstack/react-query";

import type { DashboardOverviewResponse } from "../types/home.types";

import { getDashboardOverview } from "../api/home.api";

export const useDashboardOverview = () => {
  return useQuery<DashboardOverviewResponse>({
    queryKey: ["user", "dashboard", "overview"],
    queryFn: getDashboardOverview,
  });
};
