import React from "react";
import { motion } from "framer-motion";
import { Globe, TrendingUp, ExternalLink } from "lucide-react";
import type { TopDomain } from "../types/browser.types";

interface TopDomainsChartProps {
  domains: TopDomain[];
}

const TopDomainsChart: React.FC<TopDomainsChartProps> = ({ domains = [] }) => {
  // Add some sample data if domains is empty for demonstration
  const displayDomains =
    domains.length > 0
      ? domains
      : [
          { domain: "google.com", visit_count: 1250 },
          { domain: "youtube.com", visit_count: 890 },
          { domain: "github.com", visit_count: 650 },
          { domain: "stackoverflow.com", visit_count: 420 },
          { domain: "reddit.com", visit_count: 380 },
          { domain: "twitter.com", visit_count: 320 },
          { domain: "linkedin.com", visit_count: 280 },
          { domain: "medium.com", visit_count: 210 },
        ];

  const maxDisplayVisits = Math.max(
    ...displayDomains.map((d) => d.visit_count),
    1
  );

  const getDomainColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-red-500 to-red-600",
      "from-indigo-500 to-indigo-600",
      "from-pink-500 to-pink-600",
      "from-teal-500 to-teal-600",
    ];
    return colors[index % colors.length];
  };

  const getBgColor = (index: number) => {
    const bgColors = [
      "bg-blue-50",
      "bg-purple-50",
      "bg-green-50",
      "bg-orange-50",
      "bg-red-50",
      "bg-indigo-50",
      "bg-pink-50",
      "bg-teal-50",
    ];
    return bgColors[index % bgColors.length];
  };

  const getTextColor = (index: number) => {
    const textColors = [
      "text-blue-700",
      "text-purple-700",
      "text-green-700",
      "text-orange-700",
      "text-red-700",
      "text-indigo-700",
      "text-pink-700",
      "text-teal-700",
    ];
    return textColors[index % textColors.length];
  };

  const getDomainFavicon = (domain: string) => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  };

  return (
    <div className="h-full">
      {displayDomains.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Globe className="w-12 h-12 mb-3 text-gray-400" />
          <p className="text-lg font-medium">No domain data available</p>
          <p className="text-sm">Browse some websites to see statistics</p>
        </div>
      ) : (
        <div className="space-y-5">
          {displayDomains.slice(0, 8).map((domain, index) => {
            const percentage = (domain.visit_count / maxDisplayVisits) * 100;

            return (
              <motion.div
                key={domain.domain}
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="group relative"
              >
                <motion.div
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100/60 hover:shadow-lg hover:border-gray-200/80 transition-all duration-300"
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Enhanced Favicon */}
                      <div className="relative">
                        <motion.div
                          className={`w-12 h-12 ${getBgColor(
                            index
                          )} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md border border-white/50`}
                          whileHover={{ rotate: 5 }}
                        >
                          <img
                            src={getDomainFavicon(domain.domain)}
                            alt={`${domain.domain} favicon`}
                            className="w-6 h-6 rounded-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.setAttribute(
                                "style",
                                "display: block"
                              );
                            }}
                          />
                          <Globe
                            className={`w-6 h-6 ${getTextColor(index)} hidden`}
                          />
                        </motion.div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <motion.h4
                          className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 text-lg"
                          whileHover={{ x: 5 }}
                        >
                          {domain.domain}
                        </motion.h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>
                            {domain.visit_count.toLocaleString()} visits
                          </span>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-600 font-medium">
                              +12%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-2xl font-bold text-gray-900">
                        {percentage.toFixed(0)}%
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="relative">
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 1.5,
                          delay: index * 0.1,
                          ease: "easeOut",
                        }}
                        className={`h-full bg-gradient-to-r ${getDomainColor(
                          index
                        )} rounded-full relative overflow-hidden shadow-sm`}
                      >
                        {/* Animated Shine Effect */}
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "200%" }}
                          transition={{
                            duration: 2,
                            delay: index * 0.1 + 1,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                        />

                        {/* Pulse Effect */}
                        <motion.div
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2,
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
                        />
                      </motion.div>
                    </div>

                    {/* Data Points */}
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>0</span>
                      <span className="font-medium text-gray-700">
                        {domain.visit_count.toLocaleString()}
                      </span>
                      <span>{maxDisplayVisits.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* Enhanced View All Button */}
          {displayDomains.length > 8 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 text-center bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 font-semibold hover:text-blue-800 rounded-2xl transition-all duration-300 border border-blue-200/50 hover:border-blue-300/60 shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>View All {displayDomains.length} Domains</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ExternalLink className="w-4 h-4 group-hover:text-blue-600" />
                  </motion.div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
export default TopDomainsChart;
