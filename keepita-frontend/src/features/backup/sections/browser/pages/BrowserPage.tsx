import React, { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import { useBrowserManager } from "../hooks/browser.hooks";
import {
  SamsungSectionLayout,
  SamsungSearchAndFilterHeader,
} from "../../../../../shared/components";
import { BrowserOverview, BrowserErrorBoundary } from "../components";
import BookmarksView from "../components/BookmarksView";
import HistoryView from "../components/HistoryView";
import DownloadsView from "../components/DownloadsView";
import SearchesView from "../components/SearchesView";
import TabsView from "../components/TabsView";
import BrowserSkeleton from "../components/BrowserSkeleton";
import { BROWSER_TABS } from "../constants/browser.constants";
import {
  getSortOptionsForTab,
  getSearchPlaceholderForTab,
} from "../utils/browser.utils";
import type { BrowserTabType, BrowserFilters } from "../types/browser.types";

const BrowserPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const navigate = useNavigate();
  useDocumentTitle("Browser | xplorta");

  if (!backupId) {
    return <div>Invalid Backup ID</div>;
  }

  const {
    activeTab,
    setActiveTab,
    currentFilters,
    setFilters,
    currentSortConfig,
    setSortConfig,
    data,
    overviewData,
    statisticsData,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useBrowserManager(backupId);

  const handleBack = useCallback(() => {
    navigate(`/backups/${backupId}`);
  }, [navigate, backupId]);

  const handleTabChange = useCallback(
    (tab: BrowserTabType) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  const handleFiltersChange = useCallback(
    (filters: Partial<BrowserFilters>) => {
      setFilters(filters);
    },
    [setFilters]
  );

  const handleSortChange = useCallback(
    (config: { field: string; direction: "asc" | "desc" }) => {
      setSortConfig({
        field: config.field,
        direction: config.direction,
      });
    },
    [setSortConfig]
  );

  // Get sort options and placeholder for current tab
  const sortOptions = getSortOptionsForTab(activeTab);
  const searchPlaceholder = getSearchPlaceholderForTab(activeTab);

  // Get current tab info
  const currentTabInfo = BROWSER_TABS.find((tab) => tab.key === activeTab);

  // Get total count for current tab from overview data
  const getTotalCount = () => {
    if (!overviewData) return data?.length || 0;

    switch (activeTab) {
      case "Bookmarks":
        return overviewData.total_bookmarks;
      case "History":
        return overviewData.total_history;
      case "Downloads":
        return overviewData.total_downloads;
      case "Searches":
        return overviewData.total_searches;
      case "Tabs":
        return overviewData.total_tabs;
      case "Overview":
        return Object.values(overviewData).reduce((total, value) => {
          return typeof value === "number" ? total + value : total;
        }, 0);
      default:
        return data?.length || 0;
    }
  };

  const renderActiveTabContent = () => {
    if (isLoading && data.length === 0) {
      return <BrowserSkeleton type={activeTab} />;
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center">
            <p className="text-lg font-medium">Error loading data</p>
            <p className="text-sm text-gray-500 mt-1">
              {(error as Error)?.message || "Please try again later"}
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "Overview":
        return (
          <BrowserOverview
            overview={overviewData}
            stats={statisticsData}
            isLoading={isLoading || false}
          />
        );
      case "Bookmarks":
        return (
          <BookmarksView
            bookmarks={data}
            searchQuery={currentFilters.search || ""}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        );
      case "History":
        return (
          <HistoryView
            history={data}
            searchQuery={currentFilters.search || ""}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        );
      case "Downloads":
        return (
          <DownloadsView
            downloads={data}
            searchQuery={currentFilters.search || ""}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        );
      case "Searches":
        return (
          <SearchesView
            searches={data}
            searchQuery={currentFilters.search || ""}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        );
      case "Tabs":
        return (
          <TabsView
            tabs={data}
            searchQuery={currentFilters.search || ""}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <BrowserErrorBoundary>
      <SamsungSectionLayout
        title="Browser"
        subtitle={`${
          currentTabInfo?.label || activeTab
        } - ${getTotalCount().toLocaleString()} items`}
        onBack={handleBack}
        isLoading={isLoading}
      >
        <div className="flex flex-col h-full">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
            <div className="flex overflow-x-auto scrollbar-hide px-4 py-3">
              <div className="flex space-x-2 min-w-max">
                {BROWSER_TABS.map((tab, index) => {
                  const isActive = activeTab === tab.key;
                  const Icon = tab.icon;

                  return (
                    <motion.button
                      key={tab.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTabChange(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search and Sort Header (only for non-Overview tabs) */}
          {activeTab !== "Overview" && (
            <div className="bg-white border-b border-gray-100">
              <SamsungSearchAndFilterHeader
                searchQuery={currentFilters.search || ""}
                onSearchChange={(query) =>
                  handleFiltersChange({ search: query })
                }
                searchPlaceholder={searchPlaceholder}
                sortConfig={currentSortConfig}
                onSortChange={handleSortChange}
                sortOptions={sortOptions}
                resultsCount={getTotalCount()}
                resultsLabel={activeTab.toLowerCase()}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto"
            >
              {renderActiveTabContent()}
            </motion.div>
          </div>
        </div>
      </SamsungSectionLayout>
    </BrowserErrorBoundary>
  );
};

export default BrowserPage;
