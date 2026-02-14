import React from "react";
import { motion } from "framer-motion";

interface BackupListSkeletonProps {
  count?: number;
  isProcessing?: boolean;
}

const BackupListSkeleton: React.FC<BackupListSkeletonProps> = ({
  count = 3,
  isProcessing = false,
}) => {
  const getColumnDelay = (index: number): number => {
    return 0.08 * (index % 3) + 0.05 * Math.floor(index / 3);
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isProcessing ? [0.7, 0.4, 0.7] : 0.7,
            y: 0,
            transition: {
              opacity: isProcessing
                ? {
                    repeat: Infinity,
                    duration: 1.5,
                    repeatType: "reverse",
                  }
                : {},
              delay: getColumnDelay(index),
              duration: 0.3,
            },
          }}
          whileHover={{
            y: -5,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
            transition: { type: "spring", stiffness: 400, damping: 15 },
          }}
          className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-lg overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="absolute inset-0 overflow-hidden">
            <div className="shimmer-effect"></div>
          </div>

          <div className="flex flex-col p-5 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <div className="w-6 h-6 bg-blue-400/50 rounded animate-pulse"></div>
                </div>
                <div className="flex flex-col ml-3 gap-1">
                  <div className="h-4 w-32 bg-gray-700 animate-pulse rounded"></div>
                  <div className="h-2 w-20 bg-gray-700/50 animate-pulse rounded hidden md:block"></div>
                </div>
              </div>
              <div className="relative flex items-center justify-center p-2 rounded-full bg-red-600/30 w-8 h-8 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center">
                <div className="bg-blue-500/10 p-1 rounded mr-2">
                  <div className="w-4 h-4 bg-blue-400/50 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Type</div>
                  <div className="h-4 w-16 bg-gray-700 animate-pulse rounded mt-1"></div>
                </div>
              </div>

              <div className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center">
                <div className="bg-blue-500/10 p-1 rounded mr-2">
                  <div className="w-4 h-4 bg-blue-400/50 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">
                    Created
                  </div>
                  <div className="h-4 w-16 bg-gray-700 animate-pulse rounded mt-1"></div>
                </div>
              </div>

              <div className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center col-span-1">
                <div className="bg-blue-500/10 p-1 rounded mr-2">
                  <div className="w-4 h-4 bg-blue-400/50 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Size</div>
                  <div className="h-4 w-20 bg-gray-700 animate-pulse rounded mt-1"></div>
                </div>
              </div>

              <div className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center col-span-1">
                <div className="bg-blue-500/10 p-1 rounded mr-2">
                  <div className="w-4 h-4 bg-blue-400/50 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">
                    Status
                  </div>
                  <div className="h-4 w-20 bg-gray-700 animate-pulse rounded mt-1"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 transition-opacity duration-500">
            <div className="w-full h-full rounded-full blur-3xl bg-blue-500/10"></div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default BackupListSkeleton;
