import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHomescreenStore } from "../store/homescreen.store";
import type {
  HomescreenItem,
  HomescreenLayout,
} from "../types/homescreen.types";
import PhoneScreen from "./PhoneScreen";

interface HomescreenListProps {
  homescreenLayouts: HomescreenLayout[];
  currentLayout?: HomescreenLayout;
  isLoading: boolean;
  error: string | null;
  onItemClick?: (item: HomescreenItem) => void;
}

const HomescreenList: React.FC<HomescreenListProps> = ({
  homescreenLayouts,
  currentLayout,
  isLoading,
  error,
  onItemClick,
}) => {
  const {
    currentScreen,
    selectedLayoutId,
    setSelectedLayoutId,
    setCurrentScreen,
  } = useHomescreenStore();

  React.useEffect(() => {
    if (currentLayout && currentLayout.id.toString() !== selectedLayoutId) {
      setSelectedLayoutId(currentLayout.id.toString());
    }
  }, [currentLayout, selectedLayoutId, setSelectedLayoutId]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-8 border border-gray-100 animate-pulse"
          >
            <div className="flex justify-center">
              <div className="bg-gray-300 rounded-[3rem] w-80 h-96"></div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-red-800 font-medium mb-2">
            Error Loading Homescreen Layouts
          </h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (homescreenLayouts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-gray-900 font-medium mb-2">
            No Homescreen Layouts Found
          </h3>
          <p className="text-gray-500 text-sm">
            No homescreen layouts were found in this backup.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {homescreenLayouts.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-3">Select Layout</h3>
          <div className="flex gap-2 flex-wrap">
            {homescreenLayouts.map((layout, index) => (
              <button
                key={layout.id}
                onClick={() => setSelectedLayoutId(layout.id.toString())}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentLayout?.id === layout.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Layout {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentLayout && (
          <motion.div
            key={currentLayout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Samsung Homescreen Layout
              </h2>
              <div className="flex justify-center gap-4 text-sm text-gray-600">
                <span>
                  📱 {currentLayout.rows}×{currentLayout.columns} Grid
                </span>
                <span>📄 {currentLayout.page_count} Pages</span>
                <span>📦 {currentLayout.items.length} Items</span>
                {currentLayout.folders.length > 0 && (
                  <span>📁 {currentLayout.folders.length} Folders</span>
                )}
              </div>

              <div className="flex justify-center gap-2 mt-3 flex-wrap">
                {currentLayout.notification_panel_enabled && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    🔔 Notifications
                  </span>
                )}
                {currentLayout.quick_access_enabled && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    ⚡ Quick Access
                  </span>
                )}
                {currentLayout.badge_enabled && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    🏷️ Badges
                  </span>
                )}
                {currentLayout.layout_locked && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                    🔒 Locked
                  </span>
                )}
                {currentLayout.is_portrait_only && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    📱 Portrait Only
                  </span>
                )}
              </div>
            </div>

            <PhoneScreen
              layout={currentLayout}
              currentScreen={currentScreen}
              onItemClick={onItemClick}
              onScreenChange={setCurrentScreen}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomescreenList;
