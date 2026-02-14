import React, { useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WiFiLayout, WiFiList, WiFiDetailsModal } from "../components";
import { useWiFiNetworks, useWiFiNetworkDetails } from "../hooks/wifi.hooks";
import { useWiFiStore } from "../store/wifi.store";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import type { WiFiNetwork } from "../types/wifi.types";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";

import { useBackupDetails } from "../../../hooks/backup.hooks";
import BackupNotFound from "@/features/backup/components/BackupNotFound";

const WiFiPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const navigate = useNavigate();
  const { theme } = useBackupTheme();

  const {
    backup,
    isLoading: isBackupLoading,
    error: backupError,
  } = useBackupDetails(backupId);

  const {
    filters,
    searchQuery,
    sortConfig,
    setFilters,
    setSearchQuery,
    setSortConfig,
    clearFilters,
    reset,
  } = useWiFiStore();

  const {
    wifiNetworks,
    stats,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
  } = useWiFiNetworks(backupId!);

  const {
    currentWiFiNetwork,
    isLoadingDetails,
    isDetailsModalOpen,
    fetchWiFiNetworkDetails,
    closeModal,
  } = useWiFiNetworkDetails(backupId!);

  useDocumentTitle("WiFi | Keepita");

  useEffect(() => {
    return () => {
      reset();
    };
  }, [backupId, reset]);

  const handleBack = useCallback(() => {
    navigate(`/backups/${backupId}`);
  }, [navigate, backupId]);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery],
  );

  const handleFilterChange = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters);
    },
    [setFilters],
  );

  const handleSortChange = useCallback(
    (config: typeof sortConfig) => {
      setSortConfig(config);
    },
    [setSortConfig],
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handleWiFiClick = useCallback(
    (wifiNetwork: WiFiNetwork) => {
      fetchWiFiNetworkDetails(wifiNetwork.id.toString());
    },
    [fetchWiFiNetworkDetails],
  );

  if (!backupId || backupError || (!isBackupLoading && !backup)) {
    return <BackupNotFound />;
  }

  return (
    <WiFiLayout
      title="WiFi Networks"
      subtitle={`Backup ${backupId}`}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onBack={handleBack}
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      sortConfig={sortConfig}
      onSortChange={handleSortChange}
      totalWiFiNetworks={stats.total}
      theme={theme as "Samsung" | "Xiaomi" | "Apple"}
    >
      <WiFiList
        wifiNetworks={wifiNetworks}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        onWiFiClick={handleWiFiClick}
        theme={theme as "Samsung" | "Xiaomi" | "Apple"}
      />
      {isDetailsModalOpen && (
        <WiFiDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeModal}
          wifiNetwork={currentWiFiNetwork}
          isLoading={isLoadingDetails}
          theme={theme as "Samsung" | "Xiaomi" | "Apple"}
        />
      )}
    </WiFiLayout>
  );
};

export default WiFiPage;
