import React, { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import CallLogList from "../components/CallLogList";
import CallLogScrollToTop from "../components/CallLogScrollToTop";
import CallLogSkeletonList from "../components/CallLogSkeletonList";
import SamsungSectionLayout from "../../../../../shared/components/SamsungSectionLayout";
import SamsungSearchAndFilterHeader from "../../../../../shared/components/SamsungSearchAndFilterHeader";
import { useCallLogsQuery } from "../hooks/callLogs.hooks";
import {
  CALL_LOG_BOOLEAN_FILTERS,
  CALL_LOG_SORT_OPTIONS,
  CALL_LOG_TYPE_FILTERS,
} from "../constants/callLogs.constants";
import type { CallType } from "../types/callLogs.types";

interface CallLogsFilters {
  call_type?: CallType;
  has_contact?: boolean;
  missed_calls?: boolean;
  date_from?: string;
  date_to?: string;
  duration_min?: number;
  duration_max?: number;
  search?: string;
}

const CallLogsPage: React.FC = () => {
  const { backupId } = useParams();
  const navigate = useNavigate();
  useDocumentTitle("Call Logs | xplorta");

  console.log("CallLogsPage: backupId from params", backupId);

  const {
    callLogs,
    queryParams,
    updateQueryParams,
    totalResults,
    isLoading,
    isFetching,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCallLogsQuery(backupId);

  console.log("CallLogsPage: Hook state", {
    callLogsCount: callLogs.length,
    totalResults,
    isLoading,
    isFetching,
    error: error?.message,
    hasNextPage,
    showingSkeleton: (isLoading || isFetching) && callLogs.length === 0,
  });

  // Convert query params to filters format for the layout
  const filters = useMemo(
    (): CallLogsFilters => ({
      call_type: queryParams.call_type as CallType,
      has_contact: queryParams.has_contact,
      missed_calls: queryParams.missed_calls,
      date_from: queryParams.date_from,
      date_to: queryParams.date_to,
      duration_min: queryParams.duration_min,
      duration_max: queryParams.duration_max,
      search: queryParams.search,
    }),
    [queryParams]
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      updateQueryParams({ search });
    },
    [updateQueryParams]
  );

  const handleFilterChange = useCallback(
    (newFilters: CallLogsFilters) => {
      updateQueryParams({
        call_type: newFilters.call_type,
        has_contact: newFilters.has_contact,
        missed_calls: newFilters.missed_calls,
        date_from: newFilters.date_from,
        date_to: newFilters.date_to,
        duration_min: newFilters.duration_min,
        duration_max: newFilters.duration_max,
        search: newFilters.search,
      });
    },
    [updateQueryParams]
  );

  const handleClearFilters = useCallback(() => {
    updateQueryParams({
      call_type: undefined,
      has_contact: undefined,
      missed_calls: undefined,
      date_from: undefined,
      date_to: undefined,
      duration_min: undefined,
      duration_max: undefined,
      search: undefined,
    });
  }, [updateQueryParams]);

  const handleSortChange = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      const ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      updateQueryParams({ ordering });
    },
    [updateQueryParams]
  );

  // Parse current sort from ordering parameter
  const { sortBy, sortOrder } = useMemo(() => {
    const ordering = queryParams.ordering || "date";
    if (ordering.startsWith("-")) {
      return { sortBy: ordering.slice(1), sortOrder: "desc" as const };
    }
    return { sortBy: ordering, sortOrder: "asc" as const };
  }, [queryParams.ordering]);

  // Prepare sort options using constants
  const sortOptions = CALL_LOG_SORT_OPTIONS.map((option) => {
    // Parse the sort value to extract field and direction
    const isDesc = option.value.startsWith("-");
    const field = isDesc ? option.value.slice(1) : option.value;
    const direction = isDesc ? "desc" : "asc";

    return {
      value: option.value,
      label: option.label,
      field,
      direction: direction as "asc" | "desc",
    };
  });

  const hasActiveFilters = Boolean(
    filters.missed_calls ||
      filters.has_contact ||
      filters.call_type ||
      filters.date_from ||
      filters.date_to ||
      filters.duration_min ||
      filters.duration_max
  );

  // Create custom filter elements with both call type and boolean filters
  const customFilterElements = (
    <div className="space-y-4">
      {/* Call Type Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-800 mb-2">Call Type</h4>
        <div className="flex flex-wrap gap-2">
          {CALL_LOG_TYPE_FILTERS.map((filter) => {
            const IconComponent = filter.icon;
            const isActive = filters.call_type === filter.value;

            return (
              <button
                key={filter.value}
                onClick={() => {
                  handleFilterChange({
                    ...filters,
                    call_type: isActive
                      ? undefined
                      : (filter.value as CallType),
                  });
                }}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <IconComponent
                  className={`w-4 h-4 ${
                    filter.value === "INCOMING"
                      ? "text-green-600"
                      : filter.value === "OUTGOING"
                      ? "text-blue-600"
                      : filter.value === "MISSED"
                      ? "text-red-600"
                      : ""
                  } ${isActive ? "text-white" : ""}`}
                />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Boolean Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-800 mb-2">
          Other Filters
        </h4>
        <div className="flex flex-wrap gap-2">
          {CALL_LOG_BOOLEAN_FILTERS.map((filter) => {
            const IconComponent = filter.icon;
            const isActive =
              filters[filter.key as keyof CallLogsFilters] === true;

            return (
              <button
                key={filter.key}
                onClick={() => {
                  handleFilterChange({
                    ...filters,
                    [filter.key]: isActive ? undefined : true,
                  });
                }}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <IconComponent
                  className={`w-4 h-4 text-green-600 ${
                    isActive ? "text-white" : ""
                  }`}
                />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <SamsungSectionLayout
      title="Call logs"
      subtitle={`${totalResults} ${totalResults === 1 ? "call" : "calls"}`}
      onBack={() => navigate(`/backups/${backupId}`)}
    >
      <SamsungSearchAndFilterHeader
        searchQuery={queryParams.search || ""}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search call logs..."
        customFilterElements={customFilterElements}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        sortConfig={{ field: sortBy, direction: sortOrder }}
        onSortChange={(config) =>
          handleSortChange(config.field, config.direction)
        }
        sortOptions={sortOptions}
        resultsCount={totalResults}
        resultsLabel="calls"
      />

      {/* Main Content */}
      <div className="p-6 bg-white">
        {/* Show skeleton when initially loading and no data */}
        {(isLoading || isFetching) && callLogs.length === 0 ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">Loading call logs...</p>
            <CallLogSkeletonList count={10} />
          </div>
        ) : (
          <CallLogList
            callLogs={callLogs}
            hasNextPage={!!hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onCallLogSelect={(callLog) => console.log("Selected:", callLog)}
            error={error?.message || null}
          />
        )}
      </div>

      <CallLogScrollToTop />
    </SamsungSectionLayout>
  );
};

export default CallLogsPage;
