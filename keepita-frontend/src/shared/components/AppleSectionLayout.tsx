import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface AppleSectionLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  isLoading?: boolean;
  bgColor?: string;
}

const AppleSectionLayout: React.FC<AppleSectionLayoutProps> = ({
  children,
  title,
  subtitle,
  onBack,
  showBackButton = true,
  isLoading = false,
  bgColor = "bg-white",
}) => {
  return (
    <div className={`min-h-screen flex flex-col ${bgColor} apple-theme-font`}>
      <div className="bg-[#fff] ">
        <div className="px-4 py-3 flex items-center">
          {showBackButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-7 h-7 text-[#2F7CF5]" />
            </motion.button>
          )}
          <div className="flex-1 text-left">
            <h1 className="text-lg font-semibold  text-[#2F7CF5]">{title}</h1>
            {subtitle && (
              <p className="text-sm text-[#7F7F7F] mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="w-10" />
        </div>
      </div>

      <div className={`flex-1 ${bgColor} relative flex flex-col min-h-0`}>
        {isLoading && (
          <div className="absolute inset-0 bg-white backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </div>
    </div>
  );
};

export default AppleSectionLayout;
