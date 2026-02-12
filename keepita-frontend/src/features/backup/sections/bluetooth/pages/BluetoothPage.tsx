import React, { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BluetoothDeviceList, BluetoothLayout } from "../components";
import {
  useBluetoothManager,
  useBluetoothFilters,
} from "../hooks/bluetooth.hooks";
import { useBluetoothStore } from "../store/bluetooth.store";
import type { BluetoothFilters } from "../types/bluetooth.types";

import { useBackupDetails } from "../../../hooks/backup.hooks";
import BackupNotFound from "@/features/backup/components/BackupNotFound";

const BluetoothPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const navigate = useNavigate();
  const backupIdNumber = backupId ? parseInt(backupId, 10) : 1;

  const {
    backup,
    isLoading: isBackupLoading,
    error: backupError,
  } = useBackupDetails(backupId);

  const { sortConfig, setSortConfig } = useBluetoothStore();

  const {
    devices,
    stats,
    isLoading,
    isInitialLoading,
    isRefreshing,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useBluetoothManager(backupIdNumber);

  const { searchQuery, filters, setSearch, updateFilters, clearFilters } =
    useBluetoothFilters();

  const totalDevices = stats.total;

  const currentOrdering = sortConfig.ordering || "-last_connected";
  const isDescending = currentOrdering.startsWith("-");
  const sortBy = isDescending ? currentOrdering.slice(1) : currentOrdering;
  const sortOrder: "asc" | "desc" = isDescending ? "desc" : "asc";

  const handleSortChange = useCallback(
    (newSortBy: string, newSortOrder: "asc" | "desc") => {
      const ordering = newSortOrder === "desc" ? `-${newSortBy}` : newSortBy;
      setSortConfig({ ordering });
    },
    [setSortConfig],
  );

  const handleFilterChange = useCallback(
    (newFilters: BluetoothFilters) => {
      updateFilters(newFilters);
    },
    [updateFilters],
  );

  if (!backupId || backupError || (!isBackupLoading && !backup)) {
    return <BackupNotFound />;
  }

  return (
    <>
      <BluetoothLayout
        title="Bluetooth"
        subtitle={`${totalDevices} ${
          totalDevices === 1 ? "device" : "devices"
        }`}
        searchQuery={searchQuery}
        onSearchChange={setSearch}
        onBack={() => navigate(`/backups/${backupId}`)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        totalDevices={totalDevices}
      >
        <div className="p-6 bg-white">
          <BluetoothDeviceList
            devices={devices}
            isLoading={isLoading}
            isInitialLoading={isInitialLoading}
            isRefreshing={isRefreshing}
            error={error}
            groupByType={false}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      </BluetoothLayout>
    </>
  );
};

export default BluetoothPage;
