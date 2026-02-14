import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../../../../shared/utils/cn";

interface AlarmSkeletonListProps {
  count?: number;
  className?: string;
}

const AlarmSkeletonList: React.FC<AlarmSkeletonListProps> = ({
  count = 5,
  className,
}) => {
  return (
    <div className={cn("space-y-0", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden bg-white border-b border-gray-100 last:border-b-0"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="px-4 py-6 flex items-center justify-between">
            <div className="flex-1">
              <div className="h-8 w-24 bg-gray-200 rounded-md mb-2 animate-pulse" />

              <div className="h-4 w-32 bg-gray-200 rounded-md mb-1 animate-pulse" />

              <div className="h-3 w-20 bg-gray-200 rounded-md animate-pulse" />
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AlarmSkeletonList;
