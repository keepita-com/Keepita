import { useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getWiFiNetworks, getWiFiNetwork } from "../api/wifi.api";
import { useWiFiStore } from "../store/wifi.store";
import type { WiFiQueryParams, WiFiNetwork } from "../types/wifi.types";

const WIFI_QUERY_KEY = "wifi";

/**
 * Hook for fetching WiFi networks with infinite scroll
 * React Query is the single source of truth for server state
 */
export const useWiFiNetworks = (backupId: string) => {
  const { filters, searchQuery, sortConfig } = useWiFiStore();

  // Build query parameters from client-side state
  const buildQueryParams = useCallback((): Omit<WiFiQueryParams, "page"> => {
    return {
      page_size: 20,
      search: searchQuery || undefined,
      ordering:
        sortConfig.direction === "desc"
          ? `-${sortConfig.field}`
          : sortConfig.field,
      ...filters,
    };
  }, [filters, searchQuery, sortConfig]);

  const baseQueryParams = buildQueryParams();

  // Create query key that includes all parameters
  const queryKey = [WIFI_QUERY_KEY, backupId, baseQueryParams];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      getWiFiNetworks(backupId, {
        ...baseQueryParams,
        page: pageParam,
      }),
    enabled: !!backupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    getNextPageParam: (lastPage) =>
      lastPage.has_next ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
  });

  // Flatten all WiFi networks from React Query data
  const allWiFiNetworks = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page) => page.results);
  }, [query.data]);

  // Calculate stats from React Query data
  const stats = useMemo(() => {
    const totalFromBackend = query.data?.pages[0]?.total_results || 0;
    const secureNetworks = allWiFiNetworks.filter(
      (network) => network.security_type !== "NONE"
    ).length;
    const savedNetworks = allWiFiNetworks.filter(
      (network) => network.is_saved
    ).length;
    const connectedNetworks = allWiFiNetworks.filter(
      (network) => network.connection_status === "Connected"
    ).length;

    return {
      total: totalFromBackend,
      secure: secureNetworks,
      saved: savedNetworks,
      connected: connectedNetworks,
    };
  }, [allWiFiNetworks, query.data]);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  const refresh = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    // Server state from React Query
    wifiNetworks: allWiFiNetworks,
    stats,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    error: query.error ? (query.error as Error).message : null,

    // Actions
    loadMore,
    refresh,
    refetch: query.refetch,
  };
};

/**
 * Hook for fetching a single WiFi network
 * React Query manages the server state
 */
export const useWiFiNetwork = (backupId: string, wifiId: string) => {
  return useQuery({
    queryKey: [WIFI_QUERY_KEY, backupId, wifiId],
    queryFn: () => getWiFiNetwork(backupId, wifiId),
    enabled: !!backupId && !!wifiId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for WiFi actions and cache management
 */
export const useWiFiActions = () => {
  const queryClient = useQueryClient();

  const invalidateWiFiQueries = useCallback(
    (backupId: string) => {
      queryClient.invalidateQueries({
        queryKey: [WIFI_QUERY_KEY, backupId],
      });
    },
    [queryClient]
  );

  return {
    invalidateWiFiQueries,
  };
};

/**
 * Hook for WiFi network details modal
 * Combines React Query for server state with Zustand for UI state
 */
export const useWiFiNetworkDetails = (backupId: string) => {
  const {
    selectedWiFiNetwork,
    isDetailsModalOpen,
    setSelectedWiFiNetwork,
    openDetailsModal,
    closeDetailsModal,
  } = useWiFiStore();

  // Query for fetching network details
  const detailsQuery = useQuery({
    queryKey: [WIFI_QUERY_KEY, backupId, selectedWiFiNetwork?.id],
    queryFn: () => getWiFiNetwork(backupId, selectedWiFiNetwork!.id.toString()),
    enabled: !!backupId && !!selectedWiFiNetwork?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const fetchWiFiNetworkDetails = useCallback(
    (wifiId: string) => {
      // Find the network from current data or set a minimal network object
      const networkStub: WiFiNetwork = {
        id: parseInt(wifiId),
        ssid: "Loading...",
        security_type: "NONE",
        security_display: "Open",
        frequency: 0,
        frequency_display: "Unknown",
        connection_status: "Available",
        last_connected: "",
        last_connected_display: "Never",
        status_display: "Available",
        is_saved: false,
        hidden: false,
        password: "",
        security_strength: undefined,
        created_at: new Date().toISOString(),
        backup_model: "",
      };

      setSelectedWiFiNetwork(networkStub);
      openDetailsModal();
    },
    [setSelectedWiFiNetwork, openDetailsModal]
  );

  const handleCloseModal = useCallback(() => {
    closeDetailsModal();
  }, [closeDetailsModal]);

  return {
    // Server state from React Query
    currentWiFiNetwork: detailsQuery.data || selectedWiFiNetwork,
    isLoadingDetails: detailsQuery.isLoading,
    error: detailsQuery.error ? (detailsQuery.error as Error).message : null,

    // Client state from Zustand
    isDetailsModalOpen,

    // Actions
    fetchWiFiNetworkDetails,
    closeModal: handleCloseModal,
    refetch: detailsQuery.refetch,
  };
};
