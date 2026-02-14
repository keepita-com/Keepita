import React from "react";
import { motion } from "framer-motion";

interface AppItemSkeletonProps {
  className?: string;
  theme?: "Xiaomi" | "Samsung" | "Apple";
}

const AppItemSkeleton: React.FC<AppItemSkeletonProps> = ({
  theme = "Samsung",
}) => {
  const themeStyles = {
    Samsung: {
      iconBorderRadius: "rounded-[22%]",
      nameBgColor: "bg-black/20",
      sizeBgColor: "bg-black/15",
    },
    Xiaomi: {
      iconBorderRadius: "rounded-[22%]",
      nameBgColor: "bg-stone-200",
      sizeBgColor: "bg-stone-100",
    },
    Apple: {
      iconBorderRadius: "rounded-2xl",
      nameBgColor: "bg-gray-200",
      sizeBgColor: "bg-gray-100",
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center p-3 w-full max-w-[120px]"
    >
      <div className="relative mb-3">
        <div
          className={`w-16 h-16 bg-gray-200 ${currentTheme.iconBorderRadius} animate-pulse`}
        />

        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent ${currentTheme.iconBorderRadius} animate-shimmer`}
        />
      </div>

      <div className="text-center w-full space-y-2">
        <div
          className={`h-3.5 ${currentTheme.nameBgColor} rounded animate-pulse w-20 mx-auto`}
        />

        <div
          className={`h-2.5 ${currentTheme.sizeBgColor} rounded animate-pulse w-12 mx-auto`}
        />
      </div>
    </motion.div>
  );
};

interface AppListSkeletonProps {
  count?: number;
  theme?: "Xiaomi" | "Samsung" | "Apple";
}

const AppListSkeleton: React.FC<AppListSkeletonProps> = ({
  count = 32,
  theme = "Samsung",
}) => {
  return (
    <div className="px-4 py-2 bg-transparent">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-x-4 gap-y-8 justify-items-center">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="w-full flex justify-center">
            <AppItemSkeleton theme={theme} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppListSkeleton;
