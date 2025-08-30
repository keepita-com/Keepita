import { type ChartData } from "chart.js";
import type { DashboardOverviewResponse } from "../types/home.types";

export const getLineChartData = (
  data?: DashboardOverviewResponse["uploads_overview"]
): ChartData<"line"> => {
  let chartLabels = ["0", "1"];
  let chartData = [0, 0];

  if (data) {
    chartLabels = data.map((i) => i.date);
    chartData = data.map((i) => i.count);
  }

  return {
    labels: chartLabels,
    datasets: [
      {
        label: "Uploads",
        data: chartData,
        borderColor: "rgba(45, 212, 191, 1)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          gradient.addColorStop(0, "rgba(45, 212, 191, 0.3)");
          gradient.addColorStop(1, "rgba(45, 212, 191, 0.0)");
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(45, 212, 191, 1)",
        pointBorderColor: "#111827",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };
};

export const getBarChartData = (
  data?: DashboardOverviewResponse["phone_models"]
): ChartData<"bar"> => {
  let chartLabels = ["0", "1"];
  let chartData = [0, 0];

  if (data) {
    chartLabels = data.map((i) => i.device_name);
    chartData = data.map((i) => i.upload_count);
  }

  return {
    labels: chartLabels,
    datasets: [
      {
        label: "Phones",
        data: chartData,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const colorArray = [
            "rgba(56, 189, 248, 0.9)",
            "rgba(167, 139, 250, 0.9)",
            "rgba(251, 113, 133, 0.9)",
            "rgba(45, 212, 191, 0.9)",
            "rgba(253, 186, 116, 0.9)",
            "rgba(129, 140, 248, 0.9)",
            "rgba(244, 114, 182, 0.9)",
          ];

          if (!context?.parsed?.y) {
            return colorArray[context.dataIndex % colorArray.length];
          }

          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          const color = colorArray[context.dataIndex % colorArray.length];
          const baseColor = color.replace("0.9", "0.9");
          const fadeColor = color.replace("0.9", "0.6");
          gradient.addColorStop(0, baseColor);
          gradient.addColorStop(1, fadeColor);
          return gradient;
        },
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };
};

export const getDoughnutData = (
  data?: DashboardOverviewResponse["medias"]
): ChartData<"doughnut"> => {
  let chartData = [0, 0, 0, 0];

  if (data) {
    const validData = Object.values(data);
    chartData = validData;
  }

  return {
    labels: ["Videos", "Images", "Musics", "Others"],
    datasets: [
      {
        data: chartData,
        backgroundColor: [
          "rgba(56, 189, 248, 0.9)",
          "rgba(167, 139, 250, 0.9)",
          "rgba(251, 113, 133, 0.9)",
          "gray",
        ],
        borderWidth: 4,
        borderColor: "#111827",
        hoverOffset: 15,
        hoverBorderWidth: 0,
      },
    ],
  };
};

export const getStatsData = () => [
  {
    title: "Total Users",
    value: "2,845",
    trend: 12.5,
    icon: "Users",
    bgColor: "bg-sky-500/30",
    borderColor: "border-sky-500/30",
  },
  {
    title: "Active Sessions",
    value: "845",
    trend: -3.2,
    icon: "ActivitySquare",
    bgColor: "bg-violet-500/30",
    borderColor: "border-violet-500/30",
  },
  {
    title: "Total Revenue",
    value: "$48,352",
    trend: 18.7,
    icon: "Wallet",
    bgColor: "bg-teal-500/30",
    borderColor: "border-teal-500/30",
  },
  {
    title: "Conversion Rate",
    value: "24.8%",
    trend: 5.3,
    icon: "TrendingUp",
    bgColor: "bg-rose-500/30",
    borderColor: "border-rose-500/30",
  },
];
