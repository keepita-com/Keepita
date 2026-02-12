import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BROWSER_TABS } from "../constants/browser.constants";
import type { BrowserTabType } from "../types/browser.types";
import { cn } from "../../../../../shared/utils/cn";

interface BrowserLayoutProps {
  children: React.ReactNode;
  activeTab: BrowserTabType;
  onTabChange: (tab: BrowserTabType) => void;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

const BrowserLayout: React.FC<BrowserLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  title = "Browser Data",
  subtitle,
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 border-b bg-white">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </header>

      <nav className="flex space-x-2 p-2 bg-white border-b sticky top-0 z-10">
        {BROWSER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100",
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
export default BrowserLayout;
