import React, { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import { AlarmsLayout, AlarmList } from "../components";
import { useAlarmsQuery } from "../hooks/alarm.hooks";
import type { GetAlarmsParams } from "../types/alarm.types";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";

import { useBackupDetails } from "../../../hooks/backup.hooks";
import BackupNotFound from "@/features/backup/components/BackupNotFound";

const AlarmsPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const navigate = useNavigate();
  useDocumentTitle("Alarms | Keepita");
  const { theme } = useBackupTheme();

  const numericBackupId = backupId ? parseInt(backupId, 10) : 0;

  const {
    backup,
    isLoading: isBackupLoading,
    error: backupError,
  } = useBackupDetails(backupId);

  const {
    alarms,
    isLoading,
    error,
    refetch,

    queryParams,
    updateQueryParams,
    clearFilters,

    stats,
  } = useAlarmsQuery(numericBackupId);

  const handleBack = useCallback(() => {
    navigate(`/backups/${backupId}`);
  }, [navigate, backupId]);

  const handleSearchChange = useCallback(
    (search: string) => {
      updateQueryParams({ search: search || undefined });
    },
    [updateQueryParams],
  );

  const handleFiltersChange = useCallback(
    (filters: Partial<GetAlarmsParams>) => {
      updateQueryParams(filters);
    },
    [updateQueryParams],
  );

  const handleSortChange = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      const ordering = `${sortOrder === "desc" ? "-" : ""}${sortBy}`;
      updateQueryParams({ ordering });
    },
    [updateQueryParams],
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const filters: Partial<GetAlarmsParams> = {
    search: queryParams.search,
    active: queryParams.active,
    repeat_type: queryParams.repeat_type,
  };

  const sortBy = queryParams.ordering?.replace(/^-/, "") || "time";
  const sortOrder = (queryParams.ordering?.startsWith("-") ? "desc" : "asc") as
    | "asc"
    | "desc";

  const themes = {
    Samsung: {
      mainContentWrraperClassNames: "p-6 bg-white",
    },
    Xiaomi: {
      mainContentWrraperClassNames: "p-6 bg-gray-100",
    },
    Apple: {
      mainContentWrraperClassNames: "p-3 mt-10",
    },
  };

  const currentTheme = themes[theme as "Samsung" | "Xiaomi" | "Apple"];

  if (!backupId || backupError || (!isBackupLoading && !backup)) {
    return <BackupNotFound />;
  }

  if (error) {
    return (
      <AlarmsLayout
        title="Alarms"
        subtitle={`Backup ${backupId}`}
        searchQuery={queryParams.search || ""}
        onSearchChange={handleSearchChange}
        onBack={handleBack}
        filters={filters}
        onFilterChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        totalAlarms={0}
        theme={theme as "Samsung" | "Xiaomi" | "Apple"}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center h-64"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading alarms
            </h3>
            <p className="text-gray-500 mb-4">
              {error.message || "Unknown error"}
            </p>
            <motion.button
              onClick={() => refetch()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
            >
              Try again
            </motion.button>
          </div>
        </motion.div>
      </AlarmsLayout>
    );
  }

  return (
    <AlarmsLayout
      title="Alarms"
      subtitle={`${stats.totalAlarms} ${
        stats.totalAlarms === 1 ? "alarm" : "alarms"
      } • ${stats.activeAlarms} active`}
      searchQuery={queryParams.search || ""}
      onSearchChange={handleSearchChange}
      onBack={handleBack}
      filters={filters}
      onFilterChange={handleFiltersChange}
      onClearFilters={handleClearFilters}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={handleSortChange}
      totalAlarms={stats.totalAlarms}
      theme={theme as "Samsung" | "Xiaomi" | "Apple"}
    >
      <div className={currentTheme.mainContentWrraperClassNames}>
        <AlarmList
          alarms={alarms}
          isLoading={isLoading}
          isInitialLoading={isLoading && alarms.length === 0}
          theme={theme as "Samsung" | "Xiaomi" | "Apple"}
        />
      </div>
    </AlarmsLayout>
  );
};

export default AlarmsPage;
