import { motion } from "framer-motion";
import React from "react";
import type { App } from "../types/app.types";

interface AppItemProps {
  app: App;
  onSelect: (app: App) => void;
}

const AppItem: React.FC<AppItemProps> = ({ app, onSelect }) => {
  if (!app) {
    console.warn("AppItem: app is null or undefined");
    return null;
  }

  // Samsung-style icon URL handling - support both new and legacy icon fields
  const iconUrl = app.icon_url || (app as any).icon;

  // Format size
  const formatSize = (sizeInMB?: number) => {
    if (!sizeInMB || sizeInMB === 0) return null;
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)}KB`;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)}MB`;
    return `${(sizeInMB / 1024).toFixed(1)}GB`;
  };

  const formattedSize = formatSize(app.size_mb);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onSelect(app)}
      className="flex flex-col items-center justify-center p-3 cursor-pointer group w-full max-w-[120px] touch-manipulation"
    >
      {/* App Icon - Enhanced Samsung Style */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative mb-3 w-16 h-16"
      >
        {/* Main App Icon with Samsung-style rounded corners - NO GRAY BACKGROUND */}
        <div className="w-16 h-16 rounded-[22%] overflow-hidden">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={`${app.apk_name} icon`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
          ) : null}
        </div>
      </motion.div>

      {/* App Information - Enhanced Samsung One UI Style */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="text-center w-full px-1 relative"
      >
        {/* App Name - Single line with ellipsis and hover tooltip */}
        <div className="relative group">
          <p className="text-sm text-black/95 font-medium leading-tight mb-1 truncate w-full">
            {app.apk_name}
          </p>

          {/* Hover Tooltip for Full Name */}
          {app.apk_name.length > 12 && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {app.apk_name}
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>

        {/* App Size - Always show if available */}
        {formattedSize && (
          <p className="text-xs text-black/70 leading-none">{formattedSize}</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AppItem;
