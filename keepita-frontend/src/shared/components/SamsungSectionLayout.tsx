/**
 * SamsungSectionLayout.tsx
 * Samsung One UI inspired layout component matching Samsung Settings design
 */
import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wifi, Battery, Signal } from "lucide-react";

interface SamsungSectionLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  isLoading?: boolean;
}

const SamsungSectionLayout: React.FC<SamsungSectionLayoutProps> = ({
  children,
  title,
  subtitle,
  onBack,
  showBackButton = true,
  isLoading = false,
}) => {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Samsung Status Bar */}
      <div className="h-7 bg-white flex items-center justify-between px-4 text-xs font-medium text-black border-b border-gray-100">
        <div className="flex items-center space-x-1">
          <span>{currentTime}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Wifi className="w-3 h-3" />
          <Signal className="w-3 h-3" />
          <Battery className="w-4 h-3" />
          <span className="text-xs">100%</span>
        </div>
      </div>

      {/* Header with Back Button and Title */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-4 flex items-center">
          {showBackButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>
          )}
          <div>
            <h1 className="text-xl font-medium text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white relative flex flex-col min-h-0">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="bg-white flex-1 flex flex-col min-h-0">{children}</div>
      </div>
    </div>
  );
};

export default SamsungSectionLayout;
