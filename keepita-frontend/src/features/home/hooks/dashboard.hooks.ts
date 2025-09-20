import { useRef } from "react";
import type { ChartOptions } from "chart.js";
import { getStatsData } from "../data/dashboardData";
import { getQuickActionsData } from "../utils/dashboard.utils";
import {
  baseChartOptions,
  doughnutChartOptions,
} from "../configs/chartConfigs";

export const useDashboard = () => {
  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const doughnutChartRef = useRef<HTMLDivElement>(null);

  const statsData = getStatsData();
  const quickActionsData = getQuickActionsData();

  return {
    lineChartRef,
    barChartRef,
    doughnutChartRef,
    statsData,
    quickActionsData,
    chartOptions: baseChartOptions as ChartOptions<"line">,
    doughnutOptions: doughnutChartOptions as ChartOptions<"doughnut">,
  };
};
