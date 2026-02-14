import React, { useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Smartphone, AlertCircle } from "lucide-react";
import AppItem from "./AppItem";
import AppDetailsModal from "./AppDetailsModal";
import type { App } from "../types/app.types";
import { AppListSkeleton } from ".";

interface AppListProps {
  apps: App[];
  isLoading?: boolean;
  isInitialLoading?: boolean;
  error?: Error | null;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  onAppSelect: (app: App) => void;
  emptyStateMessage?: string;
  backupId: string | number;
  theme?: "Xiaomi" | "Samsung" | "Apple";
}

const AppList: React.FC<AppListProps> = ({
  apps,
  isLoading = false,
  isInitialLoading = false,
  error,
  hasNextPage = false,
  fetchNextPage,
  isFetchingNextPage = false,
  onAppSelect,
  emptyStateMessage = "No apps found",
  backupId,
  theme,
}) => {
  const lastAppRef = useRef<HTMLDivElement>(null);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAppSelect = (app: App) => {
    setSelectedApp(app);
    setIsModalOpen(true);
    onAppSelect(app);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApp(null);
  };

  const lastAppElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (lastAppRef.current) lastAppRef.current = null;
      if (node) lastAppRef.current = node;

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && fetchNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.observe(node);
      return () => {
        if (node) observer.unobserve(node);
      };
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  if (isInitialLoading) {
    return (
      <div className="p-6 bg-transparent">
        <AppListSkeleton count={20} theme={theme} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Apps
          </h3>
          <p className="text-gray-600 mb-4">
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }
  const emptyApps = {
    Samsung: {
      iconClassNames: "text-blue-400 w-12 h-12",
    },
    Xiaomi: {
      iconClassNames: "text-orange-600 w-12 h-12",
    },
    Apple: {
      iconClassNames: "text-blue-600 w-12 h-12",
    },
  };
  const currentEmptyApps =
    emptyApps[(theme as keyof typeof emptyApps) || "Samsung"];

  if (!isLoading && !isFetchingNextPage && apps.length === 0) {
    return (
      <div className="p-6 bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto ">
              <Smartphone className={currentEmptyApps.iconClassNames} />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-3xl blur-xl"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {emptyStateMessage}
          </h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 bg-transparent">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-x-4 gap-y-8 justify-items-center">
        <AnimatePresence>
          {apps.filter(Boolean).map((app, index) => {
            const isLast = index === apps.length - 1;
            return (
              <motion.div
                key={app?.id || `app-${index}`}
                ref={isLast ? lastAppElementRef : undefined}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  delay: index * 0.01,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="w-full flex justify-center"
              >
                <AppItem app={app} onSelect={handleAppSelect} theme={theme} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8 mt-6"
        >
          <div className="flex items-center space-x-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading more apps...</span>
          </div>
        </motion.div>
      )}

      {!hasNextPage && apps.length > 0 && !isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 mt-6"
        >
          <p className="text-sm text-gray-500">
            You've reached the end of the list
          </p>
        </motion.div>
      )}

      <AppDetailsModal
        app={selectedApp}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        backupId={backupId}
        theme={theme}
      />
    </div>
  );
};

export default AppList;
