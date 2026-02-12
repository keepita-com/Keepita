import React from "react";
import { motion } from "framer-motion";
import type {
  BrowserOverviewInterface,
  BrowserStatistics,
  BrowserTabType,
} from "../types/browser.types";
import {
  Bookmark,
  Clock,
  Download,
  Search,
  TabletSmartphone,
  Globe,
  Activity,
} from "lucide-react";
import TopDomainsChart from "./TopDomainsChart";

interface BrowserOverviewProps {
  overview?: BrowserOverviewInterface;
  stats?: BrowserStatistics;
  isLoading: boolean;
  theme?: "Samsung" | "Xiaomi" | "Apple";
  handleTabChange?: (tab: BrowserTabType) => void;
}

const BrowserOverview: React.FC<BrowserOverviewProps> = ({
  overview,
  isLoading,
  theme = "Samsung",
  handleTabChange,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const overviewThemes = {
    Samsung: {
      containerClassNames:
        "w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/50",
      statsCartWrapperClassNames:
        "relative bg-white/90 backdrop-blur-md rounded-3xl p-6 hover:shadow-md transition-all duration-500 border border-white/60 group-hover:border-white/80",
      statsChangeColor: "text-green-600",
      statsValueClassNames:
        "text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300",
      statsLabelClassNames: "text-gray-600 text-sm font-medium",
      topDomainsWrapperClassNames:
        "bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 relative overflow-hidden",
      topDomainsBgGradientElement: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 rounded-3xl" />
      ),
      topDomainsTitleClassNames: "text-2xl font-bold text-gray-900 mb-2",
      topDomainsCaptionClassNames: "text-gray-600 flex items-center space-x-2",
      topDomainCaptionDot: (
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      ),
      activityIconWrapperClassNames:
        "p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-md",
      activityIconClassNames: "w-6 h-6 text-blue-600",
      activityCartWrapperClassNames:
        "bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/60 relative overflow-hidden",
      clockIconWrapperClassNames:
        "p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-md",
      clockIconClassNames: "w-6 h-6 text-green-600",
      activityCartBgGradientElement: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-emerald-50/30 rounded-3xl" />
      ),
      activitiesTitlesClassNames: {
        title: "text-xl font-bold text-gray-900",
        subTitle: "text-gray-600 text-sm",
      },
      activityItemClassNames:
        "group relative p-4 bg-gray-50/70 backdrop-blur-sm rounded-2xl hover:bg-gray-100/70 transition-all duration-300 cursor-pointer",
      activityItemTitleClassNames:
        "text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors",
      viewAllHistoryButton: {
        wrapper:
          "w-full mt-4 py-3 text-center bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 font-medium hover:text-green-800 rounded-2xl transition-all duration-300 border border-green-200/50 hover:border-green-300/60 group",
        icon: "w-4 h-4 group-hover:text-green-600",
      },
      emptyRecentHistory: {
        wrapperClassNames:
          "flex flex-col items-center justify-center h-64 text-gray-500",
        iconClassNames: "w-12 h-12 mb-3 text-gray-400",
      },
    },
    Xiaomi: {
      containerClassNames: "w-full overflow-hidden bg-red-50",
      statsCartWrapperClassNames:
        "relative bg-red-50 rounded-3xl p-6 transition-all duration-500 border border-red-200 group-hover:border-red/300",
      statsChangeColor: "text-stone-700",
      statsValueClassNames:
        "text-3xl font-bold text-stone-700 group-hover:scale-105 transition-transform duration-300",
      statsLabelClassNames: "text-stone-700 text-sm font-medium",
      topDomainsWrapperClassNames:
        "bg-red-100 rounded-3xl p-8 shadow-xl border border-red-200/50 relative overflow-hidden",
      topDomainsBgGradientElement: null,
      topDomainsTitleClassNames: "text-2xl font-bold text-stone-700 mb-2",
      topDomainsCaptionClassNames: "text-stone-700 flex items-center space-x-2",
      topDomainCaptionDot: null,
      activityIconWrapperClassNames: "p-3 bg-red-200 rounded-2xl",
      activityIconClassNames: "w-6 h-6 text-stone-700",
      activityCartWrapperClassNames:
        "bg-red-100 rounded-3xl p-6  border border-red-200/50  relative overflow-hidden",
      clockIconWrapperClassNames: "p-3 bg-red-200 rounded-2xl",
      clockIconClassNames: "w-5 h-5 text-stone-700",
      activityCartBgGradientElement: null,
      activitiesTitlesClassNames: {
        title: "text-xl font-bold text-stone-700",
        subTitle: "text-stone-700 text-sm",
      },
      activityItemClassNames:
        "group relative p-3 bg-red-50 backdrop-blur-sm rounded-2xl cursor-pointer",
      activityItemTitleClassNames:
        "text-sm font-medium text-stone-700 truncate group-hover:text-stone-800 transition-colors",
      viewAllHistoryButton: {
        wrapper:
          "w-full mt-4 py-3 text-center bg-red-200 text-stone-700 font-medium rounded-2xl transition-all duration-300 border border-red-200/80 hover:border-green-red group",
        icon: "w-4 h-4",
      },
      emptyRecentHistory: {
        wrapperClassNames:
          "flex flex-col items-center justify-center h-64 text-stone-700",
        iconClassNames: "w-12 h-12 mb-3 text-stone-700",
      },
    },
    Apple: {
      containerClassNames: "w-full overflow-hidden bg-white",
      statsCartWrapperClassNames:
        "relative bg-white rounded-3xl p-6 hover:shadow-md transition-all duration-500 border border-gray-200 group-hover:border-gray-300",
      statsChangeColor: "text-blue-600",
      statsValueClassNames:
        "text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300",
      statsLabelClassNames: "text-gray-600 text-sm font-medium",
      topDomainsWrapperClassNames:
        "bg-white rounded-3xl p-8 shadow-xl border border-gray-200 relative overflow-hidden",
      topDomainsBgGradientElement: null,
      topDomainsTitleClassNames: "text-2xl font-bold text-gray-900 mb-2",
      topDomainsCaptionClassNames: "text-gray-600 flex items-center space-x-2",
      topDomainCaptionDot: null,
      activityIconWrapperClassNames: "p-3 bg-gray-100 rounded-2xl shadow-md",
      activityIconClassNames: "w-6 h-6 text-gray-700",
      activityCartWrapperClassNames:
        "bg-white rounded-3xl p-6 shadow-xl border border-gray-200 relative overflow-hidden",
      clockIconWrapperClassNames: "p-3 bg-gray-100 rounded-2xl shadow-md",
      clockIconClassNames: "w-6 h-6 text-gray-700",
      activityCartBgGradientElement: null,
      activitiesTitlesClassNames: {
        title: "text-xl font-bold text-gray-900",
        subTitle: "text-gray-600 text-sm",
      },
      activityItemClassNames:
        "group relative p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer",
      activityItemTitleClassNames:
        "text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors",
      viewAllHistoryButton: {
        wrapper:
          "w-full mt-4 py-3 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium hover:text-gray-800 rounded-2xl transition-all duration-300 border border-gray-200 hover:border-gray-300 group",
        icon: "w-4 h-4 group-hover:text-gray-600",
      },
      emptyRecentHistory: {
        wrapperClassNames:
          "flex flex-col items-center justify-center h-64 text-gray-500",
        iconClassNames: "w-12 h-12 mb-3 text-gray-400",
      },
    },
  };

  const currentTheme = overviewThemes[theme];

  const statsData = [
    {
      icon: Bookmark,
      label: "Bookmarks",
      value: overview?.total_bookmarks ?? 0,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: Clock,
      label: "History Entries",
      value: overview?.total_history ?? 0,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: Download,
      label: "Downloads",
      value: overview?.total_downloads ?? 0,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: Search,
      label: "Searches",
      value: overview?.total_searches ?? 0,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: TabletSmartphone,
      label: "Open Tabs",
      value: overview?.total_tabs ?? 0,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];
  return (
    <div className={currentTheme.containerClassNames}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 px-6"
      >
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.1 * index,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              className="group relative mt-8"
            >
              <div className={currentTheme.statsCartWrapperClassNames}>
                <div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${
                      stat.color.split(" ")[1]
                    }, ${stat.color.split(" ")[3]})`,
                  }}
                />

                <motion.div
                  className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${
                      stat.color.split(" ")[1]
                    }, ${stat.color.split(" ")[3]})`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className={`p-3 ${stat.bgColor} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-md`}
                      whileHover={{ rotate: 5 }}
                    >
                      <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                    </motion.div>
                  </div>

                  <div className="space-y-2"></div>

                  <div className="space-y-2">
                    <motion.h3
                      className={currentTheme.statsValueClassNames}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {stat.value.toLocaleString()}
                    </motion.h3>
                    <p className={currentTheme.statsLabelClassNames}>
                      {stat.label}
                    </p>

                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r"
                        style={{
                          background: `linear-gradient(90deg, ${
                            stat.color.split(" ")[1]
                          }, ${stat.color.split(" ")[3]})`,
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (stat.value /
                              Math.max(...statsData.map((s) => s.value))) *
                              100,
                            100,
                          )}%`,
                        }}
                        transition={{
                          duration: 1.5,
                          delay: 0.5 + index * 0.1,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 px-6">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <div className={currentTheme.topDomainsWrapperClassNames}>
            {currentTheme.topDomainsBgGradientElement}

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className={currentTheme.topDomainsTitleClassNames}>
                    Top Domains
                  </h3>
                  <p className={currentTheme.topDomainsCaptionClassNames}>
                    <span>Most visited websites</span>
                    {currentTheme.topDomainCaptionDot}
                  </p>
                </div>
                <motion.div
                  className={currentTheme.activityIconWrapperClassNames}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Activity className={currentTheme.activityIconClassNames} />
                </motion.div>
              </div>
              <TopDomainsChart
                theme={theme as "Samsung" | "Xiaomi" | "Apple"}
                domains={overview?.top_domains ?? []}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="space-y-6"
        >
          <div className={currentTheme.activityCartWrapperClassNames}>
            {currentTheme.activityCartBgGradientElement}

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  className={currentTheme.clockIconWrapperClassNames}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <Clock className={currentTheme.clockIconClassNames} />
                </motion.div>
                <div>
                  <h3 className={currentTheme.activitiesTitlesClassNames.title}>
                    Recent History
                  </h3>
                  <p
                    className={currentTheme.activitiesTitlesClassNames.subTitle}
                  >
                    Recently visited sites
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(overview?.recent_history ?? []).length === 0 ? (
                  <div
                    className={
                      currentTheme.emptyRecentHistory.wrapperClassNames
                    }
                  >
                    <Clock
                      className={currentTheme.emptyRecentHistory.iconClassNames}
                    />
                    <p className="text-lg font-medium">
                      No recent history available
                    </p>
                    <p className="text-sm">No sites visited recently</p>
                  </div>
                ) : (
                  (overview?.recent_history ?? [])
                    .slice(0, 5)
                    .map((historyItem, index) => {
                      const timeAgo = new Date(
                        Date.now() -
                          new Date(historyItem.last_visit_time).getTime(),
                      );
                      const minutesAgo = Math.floor(
                        timeAgo.getTime() / (1000 * 60),
                      );
                      const hoursAgo = Math.floor(minutesAgo / 60);
                      const timeDisplay =
                        hoursAgo > 0
                          ? `${hoursAgo}h ago`
                          : `${minutesAgo}m ago`;

                      return (
                        <motion.div
                          key={historyItem.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + index * 0.1 }}
                          className={currentTheme.activityItemClassNames}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <img
                                  src={`https://www.google.com/s2/favicons?domain=${
                                    new URL(historyItem.url).hostname
                                  }&sz=32`}
                                  alt="favicon"
                                  className="w-4 h-4 rounded-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling?.setAttribute(
                                      "style",
                                      "display: block",
                                    );
                                  }}
                                />
                                <Globe className="w-4 h-4 text-blue-600 hidden" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4
                                className={
                                  currentTheme.activityItemTitleClassNames
                                }
                              >
                                {historyItem.title}
                              </h4>
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {new URL(historyItem.url).hostname}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs text-gray-400">
                                  {timeDisplay}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">
                                  {historyItem.visit_count} visits
                                </span>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                )}

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className={currentTheme.viewAllHistoryButton.wrapper}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange?.("History")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className={currentTheme.viewAllHistoryButton.icon} />
                    <span>View All History</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default BrowserOverview;
