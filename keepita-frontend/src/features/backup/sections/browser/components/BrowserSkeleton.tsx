import React from "react";
import { motion } from "framer-motion";
import type { BrowserTabType } from "../types/browser.types";

interface BrowserSkeletonProps {
  type: BrowserTabType;
  count?: number;
}

const BrowserSkeleton: React.FC<BrowserSkeletonProps> = ({
  type,
  count = 8,
}) => {
  if (type === "Overview") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {/* Stat Cards Skeleton */}
        {Array.from({ length: 5 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Chart Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100"
        >
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </motion.div>

        {/* List Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-1 bg-white rounded-2xl p-6 border border-gray-100"
        >
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-24" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // List skeleton for other tabs
  return (
    <div className="space-y-1 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-gray-50 rounded-2xl p-4"
        >
          <div className="flex items-start space-x-3">
            {/* Icon/Favicon Skeleton */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />

                  {/* Subtitle/URL */}
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-2 w-1/2" />

                  {/* Metadata */}
                  <div className="flex items-center space-x-4">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                    {type === "Downloads" && (
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                    )}
                  </div>

                  {/* Progress bar for downloads */}
                  {type === "Downloads" && Math.random() > 0.7 && (
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded animate-pulse w-full" />
                    </div>
                  )}
                </div>

                {/* Action buttons skeleton */}
                <div className="flex items-center space-x-2 ml-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  {type === "Searches" && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BrowserSkeleton;
