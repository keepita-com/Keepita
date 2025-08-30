import { type ChartOptions } from "chart.js";

export const baseChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 2000,
    easing: "easeOutQuart",
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(180, 180, 200, 0.15)",
      },
      ticks: {
        color: "#f9fafb",
        font: {
          size: 11,
        },
      },
      border: {
        display: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#f9fafb",
        font: {
          size: 11,
        },
      },
      border: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: "#f9fafb",
        usePointStyle: true,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleColor: "#ffffff",
      bodyColor: "#f9fafb",
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      usePointStyle: true,
      borderColor: "rgba(45, 212, 191, 0.6)",
      borderWidth: 1,
      titleFont: {
        size: 13,
        weight: "bold" as const,
      },
      bodyFont: {
        size: 12,
      },
    },
  },
};

export const doughnutChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 2000,
    easing: "easeOutQuart" as const,
  },
  plugins: {
    legend: {
      position: "right" as const,
      labels: {
        color: "#ffffff",
        padding: 20,
        usePointStyle: true,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleColor: "#ffffff",
      bodyColor: "#f3f4f6",
      padding: 12,
      cornerRadius: 8,
      borderColor: "rgba(167, 139, 250, 0.6)",
      borderWidth: 1,
      displayColors: true,
      usePointStyle: true,
    },
  },
};
