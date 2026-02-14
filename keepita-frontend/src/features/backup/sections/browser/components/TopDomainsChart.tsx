import React from "react";
import { motion } from "framer-motion";
import { Globe, ExternalLink } from "lucide-react";
import type { TopDomain } from "../types/browser.types";

interface TopDomainsChartProps {
  domains: TopDomain[];
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const TopDomainsChart: React.FC<TopDomainsChartProps> = ({
  theme = "Samsung",
  domains,
}) => {
  const chartThemes = {
    Samsung: {
      containerClassNames:
        "relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100/60 hover:shadow-lg hover:border-gray-200/80 transition-all duration-300",
      rankBadgeWrapperClassNames:
        "absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center shadow-lg",
      domainClassNames:
        "font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 text-lg",
      percentAgeClassNames: "text-2xl font-bold text-gray-900",
      domainItemClassNames:
        "relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100/60 hover:shadow-lg hover:border-gray-200/80 transition-all duration-300",
      extraLink: {
        wrapperClassNames:
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-100 rounded-lg",
        iconClassNames: "w-4 h-4 text-gray-400 hover:text-blue-600",
      },
      emptyDomains: {
        wrapperClassNames:
          "flex flex-col items-center justify-center mt-14 text-gray-500",
        iconClassNames: "w-12 h-12 mb-3 text-gray-400",
      },
    },
    Xiaomi: {
      containerClassNames:
        "relative bg-red-50  rounded-2xl p-5 shadow-md hover:shadow-lg  transition-all duration-300",
      rankBadgeWrapperClassNames:
        "absolute -top-2 -left-2 w-8 h-8 bg-stone-600 rounded-full flex items-center justify-center",
      domainClassNames: "font-bold text-stone-700 text-lg",
      percentAgeClassNames: "text-2xl font-semibold text-stone-700",
      domainItemClassNames:
        "relative bg-red-50 rounded-2xl p-5 shadow-md border border-red-100/60 hover:shadow-lg transition-all duration-300",
      extraLink: {
        wrapperClassNames:
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-red-100 rounded-lg",
        iconClassNames: "w-4 h-4 text-stone-600 hover:text-stone-700",
      },
      emptyDomains: {
        wrapperClassNames:
          "flex flex-col items-center justify-center mt-14 text-stone-700",
        iconClassNames: "w-12 h-12 mb-3 text-gray-700",
      },
    },
    Apple: {
      containerClassNames:
        "relative bg-white rounded-2xl p-5 shadow-md border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300",
      rankBadgeWrapperClassNames:
        "absolute -top-2 -left-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shadow-lg",
      domainClassNames:
        "font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 text-lg",
      percentAgeClassNames: "text-2xl font-bold text-gray-900",
      domainItemClassNames:
        "relative bg-white rounded-2xl p-5 shadow-md border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300",
      extraLink: {
        wrapperClassNames:
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-100 rounded-lg",
        iconClassNames: "w-4 h-4 text-gray-400 hover:text-blue-600",
      },
      emptyDomains: {
        wrapperClassNames:
          "flex flex-col items-center justify-center mt-14 text-gray-500",
        iconClassNames: "w-12 h-12 mb-3 text-gray-400",
      },
    },
  };
  const currentTheme = chartThemes[theme];

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
      {domains.length === 0 ? (
        <div className={currentTheme.emptyDomains.wrapperClassNames}>
          <Globe className={currentTheme.emptyDomains.iconClassNames} />
          <p className="text-lg font-medium">No domain data available</p>
        </div>
      ) : (
        <div className="space-y-5">
          {domains.slice(0, 8).map((domain, index) => {
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
                  className={currentTheme.domainItemClassNames}
                >
                  <div className={currentTheme.rankBadgeWrapperClassNames}>
                    <span className="text-white text-xs font-bold">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <motion.div
                          className={`w-12 h-12 ${getBgColor(
                            index,
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
                                "display: block",
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
                          className={currentTheme.domainClassNames}
                          whileHover={{ x: 5 }}
                        >
                          {domain.domain}
                        </motion.h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>{domain.count.toLocaleString()} visits</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      className={currentTheme.extraLink.wrapperClassNames}
                    >
                      <ExternalLink
                        className={currentTheme.extraLink.iconClassNames}
                      />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          {domains.length > 8 && (
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
                  <span>View All {domains.length} Domains</span>
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
