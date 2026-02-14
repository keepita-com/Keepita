import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { motion } from "framer-motion";
import React from "react";
import UploadsOverviewChart from "../components/charts/UploadsOverviewChart";
import UploadsMediasChart from "../components/charts/UploadsMediasChart";
import UploadsPhoneModels from "../components/charts/UploadsPhoneModels";
import DashboardHeader from "../components/DashboardHeader";
import QuickActions from "../components/QuickActions";
import UploadsFrequentContacts from "../components/UploadsFrequentContacts";
import StatCard from "../components/StatCard";
import { useDashboard as useDashboardOptions } from "../hooks/dashboard.hooks";
import {
  containerVariants,
  itemVariants,
  getDashboardStatsInfo,
  getFrequentContactsStyles,
  getIconComponent,
} from "../utils/dashboard.utils";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import { useDashboardOverview } from "../services/home.services";
import {
  getBarChartData,
  getDoughnutData,
  getLineChartData,
} from "../data/dashboardData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
);

const StatCardSkeleton = ({ index }: { index: number }) => (
  <motion.div
    custom={index}
    variants={itemVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.6 }}
    className="rounded-xl p-6 shadow-xl border border-gray-700 bg-gray-800/50 animate-pulse"
  >
    <div className="flex justify-between">
      <div>
        <div className="h-4 w-24 bg-gray-600 rounded mb-2" />
        <div className="h-8 w-16 bg-gray-600 rounded" />
      </div>
      <div className="w-12 h-12 bg-gray-600 rounded-lg" />
    </div>
  </motion.div>
);

const HomePage: React.FC = () => {
  useDocumentTitle("Home | Keepita");
  const { quickActionsData, chartOptions, doughnutOptions } =
    useDashboardOptions();

  const { data, isLoading, error } = useDashboardOverview();

  const hasData = !!data && !isLoading && !error;

  const statsInput = hasData
    ? {
        messages_count: data.messages_count ?? undefined,
        apps_count: data.apps_count ?? undefined,
        contacts_count: data.contacts_count ?? undefined,
        calls_count: data.calls_count ?? undefined,
      }
    : undefined;

  const stats = getDashboardStatsInfo(statsInput);

  const uploadsOverviewData = hasData
    ? getLineChartData(data.uploads_overview)
    : null;
  const uploadMedias = hasData ? getDoughnutData(data.medias) : null;
  const uploadsPhoneModels = hasData
    ? getBarChartData(data.phone_models)
    : null;
  const uploadsContacts = hasData
    ? getFrequentContactsStyles(data.frequently_called_contacts)
    : [];

  return (
    <div className="min-h-screen text-white relative">
      <DashboardHeader
        title="Analytics Dashboard"
        subtitle="Welcome back! Here's your latest overview"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 overflow-visible relative z-10"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={`skeleton-${index}`} index={index} />
          ))
        ) : error ? (
          <div className="col-span-full bg-red-900/30 border border-red-700/50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Failed to load dashboard data
            </h3>
            <p className="text-gray-300 mb-4">
              {error instanceof Error
                ? error.message
                : "Unknown error occurred"}
            </p>
            <p className="text-sm text-gray-400">
              Please try refreshing the page or check your connection.
            </p>
          </div>
        ) : stats.every((s) => (s.value as any) === "—") ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No analytics data available yet
          </div>
        ) : (
          stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={getIconComponent(stat.icon)}
              bgColor={stat.bgColor}
              borderColor={stat.borderColor}
              index={index}
            />
          ))
        )}
      </motion.div>

      {isLoading || error || !hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <div className="col-span-full text-center py-16 text-gray-500">
            {isLoading ? "Loading charts..." : "Charts unavailable"}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <UploadsOverviewChart
            data={uploadsOverviewData}
            options={chartOptions}
          />
          <UploadsMediasChart data={uploadMedias} options={doughnutOptions} />
          <UploadsPhoneModels
            data={uploadsPhoneModels}
            options={chartOptions}
          />
          <UploadsFrequentContacts contacts={uploadsContacts} />
          <QuickActions actions={quickActionsData} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
