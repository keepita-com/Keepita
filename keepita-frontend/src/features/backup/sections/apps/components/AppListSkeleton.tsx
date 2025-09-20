import React from "react";
import { motion } from "framer-motion";

interface AppItemSkeletonProps {}

const AppItemSkeleton: React.FC<AppItemSkeletonProps> = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
    className="flex flex-col items-center justify-center p-3 w-full max-w-[120px]"
  >
    {/* Enhanced Samsung App Icon Skeleton - No gray background */}
    <div className="relative mb-3">
      <div className="w-16 h-16 bg-gray-200 rounded-[22%] animate-pulse " />
      {/* Enhanced shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-[22%] animate-shimmer" />
    </div>

    {/* Enhanced Samsung App Name and Size Skeleton - Single line name */}
    <div className="text-center w-full space-y-2">
      {/* App name skeleton - Single line */}
      <div className="h-3.5 bg-black/20 rounded animate-pulse w-20 mx-auto" />
      {/* Size skeleton */}
      <div className="h-2.5 bg-black/15 rounded animate-pulse w-12 mx-auto" />
    </div>
  </motion.div>
);

interface AppListSkeletonProps {
  count?: number;
}

const AppListSkeleton: React.FC<AppListSkeletonProps> = ({ count = 32 }) => {
  return (
    <div className="px-4 py-2 bg-transparent">
      {/* Enhanced Responsive Samsung Grid Layout - matching AppList */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-x-4 gap-y-8 justify-items-center">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="w-full flex justify-center">
            <AppItemSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppListSkeleton;
