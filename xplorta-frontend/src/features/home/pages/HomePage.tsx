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
  ArcElement
);

const HomePage: React.FC = () => {
  useDocumentTitle("Home | xplorta");
  const { quickActionsData, chartOptions, doughnutOptions } =
    useDashboardOptions();

  const { data } = useDashboardOverview();

  const stats = getDashboardStatsInfo(
    data && {
      messages_count: data.messages_count,
      apps_count: data.apps_count,
      contacts_count: data.contacts_count,
      calls_count: data.calls_count,
    }
  );
  const uploadsOverviewData = getLineChartData(data?.uploads_overview);
  const uploadMedias = getDoughnutData(data?.medias);
  const uploadsPhoneModels = getBarChartData(data?.phone_models);
  const uploadsContacts = getFrequentContactsStyles(
    data?.frequently_called_contacts
  );

  return (
    <div className="min-h-screen  text-white relative">
      <DashboardHeader
        title="Analytics Dashboard"
        subtitle="Welcome back! Here's your latest overview"
      />
      {/* stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 overflow-visible relative z-10"
      >
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={getIconComponent(stat.icon)}
            bgColor={stat.bgColor}
            borderColor={stat.borderColor}
            index={index}
          />
        ))}
      </motion.div>
      {/* grid items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <UploadsOverviewChart
          data={uploadsOverviewData}
          options={chartOptions}
        />
        <UploadsMediasChart data={uploadMedias} options={doughnutOptions} />
        <UploadsPhoneModels data={uploadsPhoneModels} options={chartOptions} />
        <UploadsFrequentContacts contacts={uploadsContacts} />
        <QuickActions actions={quickActionsData} />
      </div>
    </div>
  );
};

export default HomePage;
