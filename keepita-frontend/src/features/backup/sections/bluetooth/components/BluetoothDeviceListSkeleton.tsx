import React from "react";
import { motion } from "framer-motion";

interface BluetoothDeviceListSkeletonProps {
  count?: number;
}

const BluetoothDeviceItemSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
  >
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
      {/* Left Side - Device Info Skeleton */}
      <div className="flex items-start space-x-4 flex-1 mb-3 sm:mb-0">
        {/* Device Icon Skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />

        {/* Device Details Skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="flex items-center space-x-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
          </div>
        </div>
      </div>

      {/* Right Side - Status Skeleton */}
      <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start space-x-4 sm:space-x-0 sm:space-y-2 sm:ml-4">
        <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
        <div className="text-left sm:text-right space-y-1">
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </motion.div>
);

const BluetoothDeviceListSkeleton: React.FC<
  BluetoothDeviceListSkeletonProps
> = ({ count = 6 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <BluetoothDeviceItemSkeleton key={index} />
      ))}
    </div>
  );
};

export default BluetoothDeviceListSkeleton;
