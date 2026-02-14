import React, { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import CallLogList from "../components/CallLogList";
import CallLogScrollToTop from "../components/CallLogScrollToTop";
import CallLogSkeletonList from "../components/CallLogSkeletonList";
import SamsungSectionLayout from "../../../../../shared/components/SamsungSectionLayout";
import XiaomiSectionLayout from "@/shared/components/XiaomiSectionLayout";
import { useCallLogsQuery } from "../hooks/callLogs.hooks";
import {
  CALL_LOG_BOOLEAN_FILTERS,
  CALL_LOG_SORT_OPTIONS,
  CALL_LOG_TYPE_FILTERS,
} from "../constants/callLogs.constants";
import type { CallType } from "../types/callLogs.types";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";
import MobileSearchAndFilterHeader from "@/shared/components/MobileSearchAndFilterHeader";
import { AppleSectionLayout } from "@/shared/components";

import { useBackupDetails } from "../../../hooks/backup.hooks";
import BackupNotFound from "@/features/backup/components/BackupNotFound";

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

type Theme = "Samsung" | "Xiaomi" | "Apple";

const themeConfig = {
  Samsung: {
    Layout: SamsungSectionLayout,
    wrapper: "p-6 bg-white",
    headerProps: { searchPlaceholder: "Search call logs...", theme: "Samsung" },
    extra: <CallLogScrollToTop />,
  },
  Xiaomi: {
    Layout: XiaomiSectionLayout,
    wrapper: "bg-red-100 px-4",
    headerProps: {
      searchPlaceholder: "Search call logs",
      theme: "Xiaomi",
      searchInputBackgroundColor: "bg-gray-100",
    },
    extra: null,
  },
  Apple: {
    Layout: AppleSectionLayout,
    wrapper: "px-4 py-2 bg-white",
    headerProps: {
      searchPlaceholder: "Search call logs... ",
      theme: "Apple",
      searchInputBackgroundColor: "bg-blue-200 shadow-none rounded-2xl",
    },
    extra: null,
  },
};

const CallLogsPage: React.FC = () => {
  const { theme } = useBackupTheme();
  const currentTheme = themeConfig[theme as Theme] ?? themeConfig.Samsung;

  const { backupId } = useParams();
  const navigate = useNavigate();
  useDocumentTitle("Call Logs | Keepita");

  const {
    backup,
    isLoading: isBackupLoading,
    error: backupError,
  } = useBackupDetails(backupId);

  if (!backupId || backupError || (!isBackupLoading && !backup)) {
    return <BackupNotFound />;
  }

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
    [queryParams],
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      updateQueryParams({ search });
    },
    [updateQueryParams],
  );

  const handleFilterChange = useCallback(
    (newFilters: CallLogsFilters) => {
      updateQueryParams(newFilters);
    },
    [updateQueryParams],
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
    [updateQueryParams],
  );

  const { sortBy, sortOrder } = useMemo(() => {
    const ordering = queryParams.ordering || "date";
    if (ordering.startsWith("-")) {
      return { sortBy: ordering.slice(1), sortOrder: "desc" as const };
    }
    return { sortBy: ordering, sortOrder: "asc" as const };
  }, [queryParams.ordering]);

  const sortOptions = CALL_LOG_SORT_OPTIONS.map((option) => {
    const isDesc = option.value.startsWith("-");
    const field = isDesc ? option.value.slice(1) : option.value;
    return {
      value: option.value,
      label: option.label,
      field,
      direction: (isDesc ? "desc" : "asc") as "asc" | "desc",
    };
  });

  const hasActiveFilters = Boolean(
    filters.missed_calls ||
    filters.has_contact ||
    filters.call_type ||
    filters.date_from ||
    filters.date_to ||
    filters.duration_min ||
    filters.duration_max,
  );

  const getFilterButtonClasses = (isActive: boolean) => {
    if (theme === "Samsung") {
      return `rounded-full ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`;
    }

    if (theme === "Apple") {
      return `rounded-2xl ${
        isActive
          ? "bg-[#007AFF] text-white"
          : "bg-white text-[#007AFF] shadow-none hover:bg-gray-50/20"
      }`;
    }

    return `rounded-lg  ${
      isActive
        ? "bg-red-300/50 text-stone-700"
        : "bg-red-200/50 text-stone-700 hover:bg-red-300/30"
    }`;
  };

  const customFilterElements = (
    <div className={`space-y-4 ${theme === "Xiaomi" && "px-4"}`}>
      <div>
        <h4 className="text-sm font-medium text-gray-800 mb-2">Call Type</h4>

        <div className="flex flex-wrap gap-2">
          {CALL_LOG_TYPE_FILTERS.map((filter) => {
            const IconComponent = filter.icon;
            const isActive = filters.call_type === filter.value;

            return (
              <button
                key={filter.value}
                onClick={() =>
                  handleFilterChange({
                    ...filters,
                    call_type: isActive
                      ? undefined
                      : (filter.value as CallType),
                  })
                }
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all ${getFilterButtonClasses(
                  isActive,
                )}`}
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
                  } ${
                    isActive && (theme === "Samsung" || theme === "Apple")
                      ? "text-white"
                      : ""
                  }`}
                />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

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
                onClick={() =>
                  handleFilterChange({
                    ...filters,
                    [filter.key]: isActive ? undefined : true,
                  })
                }
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all ${getFilterButtonClasses(
                  isActive,
                )}`}
              >
                <IconComponent
                  className={`w-4 h-4 text-green-600 ${
                    isActive && (theme === "Samsung" || theme === "Apple")
                      ? "text-white"
                      : ""
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

  const Layout = currentTheme.Layout;

  return (
    <Layout
      title="Call logs"
      subtitle={`${totalResults} ${totalResults === 1 ? "call" : "calls"}`}
      onBack={() => navigate(`/backups/${backupId}`)}
    >
      <MobileSearchAndFilterHeader
        searchQuery={queryParams.search || ""}
        onSearchChange={handleSearchChange}
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
        {...currentTheme.headerProps}
        theme={theme as Theme}
      />

      <div className={currentTheme.wrapper}>
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

      {currentTheme.extra}
    </Layout>
  );
};

export default CallLogsPage;
