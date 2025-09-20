import React, { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BluetoothDeviceList, BluetoothLayout } from "../components";
import {
  useBluetoothManager,
  useBluetoothFilters,
} from "../hooks/bluetooth.hooks";
import { useBluetoothStore } from "../store/bluetooth.store";
import type { BluetoothFilters } from "../types/bluetooth.types";

const BluetoothPage: React.FC = () => {
  // Get backup ID from URL params (assuming route structure like /backup/:backupId/bluetooth)
  const { backupId } = useParams<{ backupId: string }>();
  const navigate = useNavigate();
  const backupIdNumber = backupId ? parseInt(backupId, 10) : 1; // fallback to 1 for demo

  // Get sorting state from store
  const { sortConfig, setSortConfig } = useBluetoothStore();

  const {
    devices,
    stats,
    isLoading,
    isInitialLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useBluetoothManager(backupIdNumber);

  const { searchQuery, filters, setSearch, updateFilters, clearFilters } =
    useBluetoothFilters();

  const totalDevices = stats.total;

  // Parse current sort configuration
  const currentOrdering = sortConfig.ordering || "-last_connected";
  const isDescending = currentOrdering.startsWith("-");
  const sortBy = isDescending ? currentOrdering.slice(1) : currentOrdering;
  const sortOrder: "asc" | "desc" = isDescending ? "desc" : "asc";

  const handleSortChange = useCallback(
    (newSortBy: string, newSortOrder: "asc" | "desc") => {
      const ordering = newSortOrder === "desc" ? `-${newSortBy}` : newSortBy;
      setSortConfig({ ordering });
    },
    [setSortConfig]
  );

  const handleFilterChange = useCallback(
    (newFilters: BluetoothFilters) => {
      updateFilters(newFilters);
    },
    [updateFilters]
  );

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
        {/* Device List Section */}
        <div className="p-6 bg-white">
          <BluetoothDeviceList
            devices={devices}
            isLoading={isLoading}
            isInitialLoading={isInitialLoading}
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
