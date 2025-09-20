import React from "react";
import { useParams } from "react-router-dom";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import { AppList, AppListSkeleton, AppListLayout } from "../components";
import { useAppManager } from "../hooks/app.hooks";

/**
 * Main Apps page component with Samsung One UI design
 * Integrates all app-related functionality following existing patterns
 */
export const AppPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();

  useDocumentTitle("Apps-Backup Manager | xplorta");

  if (!backupId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 mb-2">⚠️</div>
          <div className="text-gray-600">Invalid backup ID</div>
        </div>
      </div>
    );
  }

  const {
    apps,
    stats,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    searchQuery,
    sortConfig,
    setSearchQuery,
    setSortConfig,
  } = useAppManager(backupId);

  // Handle back navigation
  const handleBack = () => {
    window.history.back();
  };

  // Handle sort change
  const handleSortChange = (field: string, order: "asc" | "desc") => {
    setSortConfig({
      field: field as any,
      direction: order,
    });
  };

  // Handle error state
  if (error) {
    return (
      <AppListLayout
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBack={handleBack}
        sortBy={sortConfig.field}
        sortOrder={sortConfig.direction}
        onSortChange={handleSortChange}
        totalApps={0}
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4 ">
          <div className="text-4xl">⚠️</div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Failed to load apps
            </h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppListLayout>
    );
  }

  return (
    <AppListLayout
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onBack={handleBack}
      sortBy={sortConfig.field}
      sortOrder={sortConfig.direction}
      onSortChange={handleSortChange}
      totalApps={stats.total}
    >
      {isLoading ? (
        <AppListSkeleton />
      ) : (
        <AppList
          apps={apps}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          backupId={backupId}
          onAppSelect={(app) => {
            console.log("Selected app:", app);
            // App details modal will be handled by AppList component
          }}
        />
      )}
    </AppListLayout>
  );
};

export default AppPage;
