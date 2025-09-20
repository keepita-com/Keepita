import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { getBluetoothDevices } from "../api/bluetooth.api";
import { useBluetoothStore } from "../store/bluetooth.store";
import type {
  BluetoothDevicesResponse,
  BluetoothFilters,
  GetBluetoothDevicesParams,
  BluetoothStats,
} from "../types/bluetooth.types";
import { isPaired, isAudioDevice } from "../utils/bluetooth.utils";

/**
 * Hook for fetching bluetooth devices with pagination
 * React Query is the single source of truth for server state
 */
export const useBluetoothDevices = (
  backupId: number,
  params: GetBluetoothDevicesParams = {}
) => {
  const queryKey = [
    "bluetooth-devices",
    backupId,
    params.page || 1,
    params.page_size || 20,
    params.search,
    params.ordering,
    params.name,
    params.address,
    params.device_class,
    params.appearance,
    params.bond_state,
    params.link_type,
    params.last_connected_after,
    params.last_connected_before,
    params.created_after,
    params.created_before,
  ];

  return useQuery({
    queryKey,
    queryFn: () => getBluetoothDevices(backupId, params),
    enabled: !!backupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for infinite scroll bluetooth devices
 * React Query manages all server state
 */
export const useBluetoothDevicesInfinite = (
  backupId: number,
  buildParams: () => GetBluetoothDevicesParams
) => {
  // Create dynamic query key that includes current parameters
  const currentParams = buildParams();
  const queryKey = [
    "bluetooth-devices-infinite",
    backupId,
    currentParams.search,
    currentParams.ordering,
    currentParams.name,
    currentParams.address,
    currentParams.device_class,
    currentParams.appearance,
    currentParams.bond_state,
    currentParams.link_type,
    currentParams.last_connected_after,
    currentParams.last_connected_before,
  ];

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const params = { ...buildParams(), page: pageParam as number };
      const response = await getBluetoothDevices(backupId, params);
      return response;
    },
    getNextPageParam: (lastPage: BluetoothDevicesResponse) => {
      return lastPage.has_next ? lastPage.current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!backupId,
    staleTime: 10 * 60 * 1000, // 10 minutes - longer stale time to prevent flashing
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
    placeholderData: (previousData) => previousData, // Keep previous data while loading new
  });
};

/**
 * Hook for bluetooth device filtering and search
 * Only manages client-side filter state
 */
export const useBluetoothFilters = () => {
  const { filters, searchQuery, setFilters, setSearchQuery, resetFilters } =
    useBluetoothStore();

  const updateFilters = useCallback(
    (newFilters: Partial<BluetoothFilters>) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const clearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const setSearch = useCallback(
    (search: string) => {
      setSearchQuery(search);
    },
    [setSearchQuery]
  );

  const setPairedOnly = useCallback(
    (pairedOnly: boolean) => {
      setFilters({ is_paired: pairedOnly });
    },
    [setFilters]
  );

  const setDeviceClass = useCallback(
    (deviceClass: number | undefined) => {
      setFilters({ device_class: deviceClass });
    },
    [setFilters]
  );

  const setBondState = useCallback(
    (bondState: number | undefined) => {
      setFilters({ bond_state: bondState });
    },
    [setFilters]
  );

  const setDateRange = useCallback(
    (dateFrom?: string, dateTo?: string) => {
      setFilters({ date_from: dateFrom, date_to: dateTo });
    },
    [setFilters]
  );

  const setNameFilter = useCallback(
    (name: string | undefined) => {
      setFilters({ name });
    },
    [setFilters]
  );

  const setAddressFilter = useCallback(
    (address: string | undefined) => {
      setFilters({ address });
    },
    [setFilters]
  );

  return {
    filters,
    searchQuery,
    updateFilters,
    clearFilters,
    setSearch,
    setPairedOnly,
    setDeviceClass,
    setBondState,
    setDateRange,
    setNameFilter,
    setAddressFilter,
  };
};

/**
 * Hook for bluetooth device management
 * React Query handles server state, Zustand handles client state
 */
export const useBluetoothManager = (backupId: number) => {
  const store = useBluetoothStore();

  // Build API parameters from store state (client-side filters)
  const buildParams = useCallback((): GetBluetoothDevicesParams => {
    const params: GetBluetoothDevicesParams = {};

    // Search query (searches name and address fields)
    if (store.searchQuery) {
      params.search = store.searchQuery;
    }

    // Individual field filters
    if (store.filters.name) {
      params.name = store.filters.name;
    }

    if (store.filters.address) {
      params.address = store.filters.address;
    }

    // Handle device_type filter by converting to device_class
    if (store.filters.device_type) {
      // Map device types to their corresponding device class values
      const deviceTypeToClass: Record<string, number> = {
        tv: 6160908, // 5E020C hex
        phone: 5898764, // 5A020C hex
        audio: 2360324, // Audio devices
        computer: 256, // Computer devices
        input: 1280, // Input devices (keyboard, mouse)
        peripheral: 1536, // Other peripheral devices
      };

      if (deviceTypeToClass[store.filters.device_type]) {
        params.device_class = deviceTypeToClass[store.filters.device_type];
      }
    } else if (store.filters.device_class !== undefined) {
      // Use direct device_class if device_type is not specified
      params.device_class = store.filters.device_class;
    }

    if (store.filters.appearance !== undefined) {
      params.appearance = store.filters.appearance;
    }

    if (store.filters.bond_state !== undefined) {
      params.bond_state = store.filters.bond_state;
    }

    if (store.filters.link_type !== undefined) {
      params.link_type = store.filters.link_type;
    }

    // Date filters
    if (store.filters.date_from) {
      params.last_connected_after = store.filters.date_from;
    }

    if (store.filters.date_to) {
      params.last_connected_before = store.filters.date_to;
    }

    // Sorting
    if (store.sortConfig.ordering) {
      params.ordering = store.sortConfig.ordering;
    }

    return params;
  }, [
    store.searchQuery,
    store.filters.name,
    store.filters.address,
    store.filters.device_class,
    store.filters.device_type,
    store.filters.appearance,
    store.filters.bond_state,
    store.filters.link_type,
    store.filters.date_from,
    store.filters.date_to,
    store.sortConfig.ordering,
  ]);

  // Use infinite scroll query for Samsung-style device loading
  const infiniteQuery = useBluetoothDevicesInfinite(backupId, buildParams);

  // Flatten all device pages into a single array (computed from React Query data)
  const allDevices = useMemo(() => {
    if (!infiniteQuery.data) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.results);
  }, [infiniteQuery.data]);

  // Calculate stats based on all devices from React Query data
  const stats: BluetoothStats = useMemo(() => {
    // Get total count from the first page response
    const totalFromBackend = infiniteQuery.data?.pages[0]?.total_results || 0;

    const paired = allDevices.filter((device) => isPaired(device)).length;
    const audioDevices = allDevices.filter((device) =>
      isAudioDevice(device)
    ).length;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyConnected = allDevices.filter((device) => {
      const lastConnected = new Date(device.last_connected);
      return lastConnected >= sevenDaysAgo;
    }).length;

    return {
      total: totalFromBackend, // Use backend total for accurate count
      paired,
      audioDevices,
      recentlyConnected,
    };
  }, [allDevices, infiniteQuery.data]);

  return {
    // Server state from React Query
    devices: allDevices,
    stats,
    totalDevices: stats.total,
    isLoading: infiniteQuery.isLoading,
    isInitialLoading: infiniteQuery.isLoading && !infiniteQuery.data,
    isRefreshing: infiniteQuery.isFetching && !infiniteQuery.isLoading,
    hasError: !!infiniteQuery.error,
    error: infiniteQuery.error ? (infiniteQuery.error as Error).message : null,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    refetch: infiniteQuery.refetch,
    refreshDevices: () => infiniteQuery.refetch(),

    // Client state from Zustand
    selectedDevice: store.selectedDevice,
    selectedDevices: store.selectedDevices,
    viewMode: store.viewMode,

    // Client actions from Zustand
    selectDevice: store.selectDevice,
    toggleDeviceSelection: store.toggleDeviceSelection,
    clearSelection: store.clearSelection,
    selectAllDevices: () => store.selectAllDevices(allDevices.map((d) => d.id)),
    setViewMode: store.setViewMode,
  };
};
