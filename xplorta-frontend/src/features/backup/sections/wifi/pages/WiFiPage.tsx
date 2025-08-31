import React, { useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WiFiLayout, WiFiList, WiFiDetailsModal } from "../components";
import { useWiFiNetworks, useWiFiNetworkDetails } from "../hooks/wifi.hooks";
import { useWiFiStore } from "../store/wifi.store";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import type { WiFiNetwork } from "../types/wifi.types";

/**
 * WiFi networks page component
 * Now uses React Query for server state and Zustand only for client state
 */
const WiFiPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const navigate = useNavigate();

  // Client-side state from Zustand
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

  // Server state from React Query
  const {
    wifiNetworks,
    stats,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
  } = useWiFiNetworks(backupId!);

  // WiFi details modal (combines React Query + Zustand)
  const {
    currentWiFiNetwork,
    isLoadingDetails,
    isDetailsModalOpen,
    fetchWiFiNetworkDetails,
    closeModal,
  } = useWiFiNetworkDetails(backupId!);

  // Set document title
  useDocumentTitle("WiFi | xplorta");

  // Reset client state when component unmounts or backupId changes
  useEffect(() => {
    return () => {
      reset();
    };
  }, [backupId, reset]);

  // Handlers
  const handleBack = useCallback(() => {
    navigate(`/backups/${backupId}`);
  }, [navigate, backupId]);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  const handleFilterChange = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const handleSortChange = useCallback(
    (config: typeof sortConfig) => {
      setSortConfig(config);
    },
    [setSortConfig]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handleWiFiClick = useCallback(
    (wifiNetwork: WiFiNetwork) => {
      fetchWiFiNetworkDetails(wifiNetwork.id.toString());
    },
    [fetchWiFiNetworkDetails]
  );

  if (!backupId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Backup ID
          </h2>
          <p className="text-gray-600">
            Please select a valid backup to view WiFi networks.
          </p>
        </div>
      </div>
    );
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
    >
      <WiFiList
        wifiNetworks={wifiNetworks}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        onWiFiClick={handleWiFiClick}
      />
      {isDetailsModalOpen && (
        <WiFiDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeModal}
          wifiNetwork={currentWiFiNetwork}
          isLoading={isLoadingDetails}
        />
      )}
    </WiFiLayout>
  );
};

export default WiFiPage;
