import React from "react";
import { motion } from "framer-motion";
import type {
  BrowserOverviewInterface,
  BrowserStatistics,
} from "../types/browser.types";
import {
  Bookmark,
  Clock,
  Download,
  Search,
  TabletSmartphone,
  TrendingUp,
  Globe,
  Activity,
} from "lucide-react";
import TopDomainsChart from "./TopDomainsChart";

interface BrowserOverviewProps {
  overview?: BrowserOverviewInterface;
  stats?: BrowserStatistics;
  isLoading: boolean;
}

const BrowserOverview: React.FC<BrowserOverviewProps> = ({
  overview,
  stats,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Loading skeleton */}
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

  const statsData = [
    {
      icon: Bookmark,
      label: "Bookmarks",
      value: overview?.total_bookmarks ?? 0,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      change: "+12%",
      changeColor: "text-green-600",
    },
    {
      icon: Clock,
      label: "History Entries",
      value: overview?.total_history ?? 0,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      change: "+8%",
      changeColor: "text-green-600",
    },
    {
      icon: Download,
      label: "Downloads",
      value: overview?.total_downloads ?? 0,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      change: "+15%",
      changeColor: "text-green-600",
    },
    {
      icon: Search,
      label: "Searches",
      value: overview?.total_searches ?? 0,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      change: "+5%",
      changeColor: "text-green-600",
    },
    {
      icon: TabletSmartphone,
      label: "Open Tabs",
      value: overview?.total_tabs ?? 0,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      change: "-2%",
      changeColor: "text-red-500",
    },
  ];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/50">
      {/* Enhanced Stats Cards Grid */}
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
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 hover:shadow-md transition-all duration-500 border border-white/60 group-hover:border-white/80">
                {/* Animated Background Pattern */}
                <div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${
                      stat.color.split(" ")[1]
                    }, ${stat.color.split(" ")[3]})`,
                  }}
                />

                {/* Floating Orb */}
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
                    <div className="flex items-center space-x-1">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <TrendingUp className={`w-4 h-4 ${stat.changeColor}`} />
                      </motion.div>
                      <span className={`text-sm font-bold ${stat.changeColor}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <motion.h3
                      className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {stat.value.toLocaleString()}
                    </motion.h3>
                    <p className="text-gray-600 text-sm font-medium">
                      {stat.label}
                    </p>

                    {/* Progress Bar */}
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
                            100
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

      {/* Enhanced Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 px-6">
        {/* Enhanced Top Domains Chart */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 rounded-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Top Domains
                  </h3>
                  <p className="text-gray-600 flex items-center space-x-2">
                    <span>Most visited websites</span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </p>
                </div>
                <motion.div
                  className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-md"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Activity className="w-6 h-6 text-blue-600" />
                </motion.div>
              </div>
              <TopDomainsChart domains={stats?.top_domains ?? []} />
            </div>
          </div>
        </motion.div>

        {/* Enhanced Activity Panel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="space-y-6"
        >
          {/* Recent Activity Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-emerald-50/30 rounded-3xl" />

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-md"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <Clock className="w-6 h-6 text-green-600" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Recent History
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Recently visited sites
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(
                  overview?.recent_history || [
                    {
                      id: 1,
                      title: "React Documentation - Getting Started",
                      url: "https://react.dev/learn",
                      last_visit_time: new Date(
                        Date.now() - 5 * 60 * 1000
                      ).toISOString(),
                      visit_count: 12,
                      hidden: false,
                    },
                    {
                      id: 2,
                      title: "GitHub - React Repository",
                      url: "https://github.com/facebook/react",
                      last_visit_time: new Date(
                        Date.now() - 15 * 60 * 1000
                      ).toISOString(),
                      visit_count: 8,
                      hidden: false,
                    },
                    {
                      id: 3,
                      title: "TypeScript Handbook",
                      url: "https://www.typescriptlang.org/docs/",
                      last_visit_time: new Date(
                        Date.now() - 30 * 60 * 1000
                      ).toISOString(),
                      visit_count: 15,
                      hidden: false,
                    },
                    {
                      id: 4,
                      title: "Tailwind CSS Documentation",
                      url: "https://tailwindcss.com/docs",
                      last_visit_time: new Date(
                        Date.now() - 45 * 60 * 1000
                      ).toISOString(),
                      visit_count: 6,
                      hidden: false,
                    },
                    {
                      id: 5,
                      title: "Framer Motion API Reference",
                      url: "https://www.framer.com/motion/",
                      last_visit_time: new Date(
                        Date.now() - 60 * 60 * 1000
                      ).toISOString(),
                      visit_count: 4,
                      hidden: false,
                    },
                  ]
                )
                  .slice(0, 5)
                  .map((historyItem, index) => {
                    const timeAgo = new Date(
                      Date.now() -
                        new Date(historyItem.last_visit_time).getTime()
                    );
                    const minutesAgo = Math.floor(
                      timeAgo.getTime() / (1000 * 60)
                    );
                    const hoursAgo = Math.floor(minutesAgo / 60);
                    const timeDisplay =
                      hoursAgo > 0 ? `${hoursAgo}h ago` : `${minutesAgo}m ago`;

                    return (
                      <motion.div
                        key={historyItem.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="group relative p-4 bg-gray-50/70 backdrop-blur-sm rounded-2xl hover:bg-gray-100/70 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Favicon */}
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
                                    "display: block"
                                  );
                                }}
                              />
                              <Globe className="w-4 h-4 text-blue-600 hidden" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
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

                          {/* Visit indicator */}
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                {/* View All History Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="w-full mt-4 py-3 text-center bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 font-medium hover:text-green-800 rounded-2xl transition-all duration-300 border border-green-200/50 hover:border-green-300/60 group"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 group-hover:text-green-600" />
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
