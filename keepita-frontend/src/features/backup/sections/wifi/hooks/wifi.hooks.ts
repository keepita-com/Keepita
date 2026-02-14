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

export const useWiFiNetworks = (backupId: string) => {
  const { filters, searchQuery, sortConfig } = useWiFiStore();

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

  const queryKey = [WIFI_QUERY_KEY, backupId, baseQueryParams];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      getWiFiNetworks(backupId, {
        ...baseQueryParams,
        page: pageParam,
      }),
    enabled: !!backupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    getNextPageParam: (lastPage) =>
      lastPage.has_next ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
  });

  const allWiFiNetworks = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page) => page.results);
  }, [query.data]);

  const stats = useMemo(() => {
    const totalFromBackend = query.data?.pages[0]?.total_results || 0;
    const secureNetworks = allWiFiNetworks.filter(
      (network) => network.security_type !== "NONE",
    ).length;
    const savedNetworks = allWiFiNetworks.filter(
      (network) => network.is_saved,
    ).length;
    const connectedNetworks = allWiFiNetworks.filter(
      (network) => network.connection_status === "Connected",
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
    wifiNetworks: allWiFiNetworks,
    stats,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    error: query.error ? (query.error as Error).message : null,

    loadMore,
    refresh,
    refetch: query.refetch,
  };
};

export const useWiFiNetwork = (backupId: string, wifiId: string) => {
  return useQuery({
    queryKey: [WIFI_QUERY_KEY, backupId, wifiId],
    queryFn: () => getWiFiNetwork(backupId, wifiId),
    enabled: !!backupId && !!wifiId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useWiFiActions = () => {
  const queryClient = useQueryClient();

  const invalidateWiFiQueries = useCallback(
    (backupId: string) => {
      queryClient.invalidateQueries({
        queryKey: [WIFI_QUERY_KEY, backupId],
      });
    },
    [queryClient],
  );

  return {
    invalidateWiFiQueries,
  };
};

export const useWiFiNetworkDetails = (backupId: string) => {
  const {
    selectedWiFiNetwork,
    isDetailsModalOpen,
    setSelectedWiFiNetwork,
    openDetailsModal,
    closeDetailsModal,
  } = useWiFiStore();

  const detailsQuery = useQuery({
    queryKey: [WIFI_QUERY_KEY, backupId, selectedWiFiNetwork?.id],
    queryFn: () => getWiFiNetwork(backupId, selectedWiFiNetwork!.id.toString()),
    enabled: !!backupId && !!selectedWiFiNetwork?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const fetchWiFiNetworkDetails = useCallback(
    (wifiId: string) => {
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
    [setSelectedWiFiNetwork, openDetailsModal],
  );

  const handleCloseModal = useCallback(() => {
    closeDetailsModal();
  }, [closeDetailsModal]);

  return {
    currentWiFiNetwork: detailsQuery.data || selectedWiFiNetwork,
    isLoadingDetails: detailsQuery.isLoading,
    error: detailsQuery.error ? (detailsQuery.error as Error).message : null,

    isDetailsModalOpen,

    fetchWiFiNetworkDetails,
    closeModal: handleCloseModal,
    refetch: detailsQuery.refetch,
  };
};
