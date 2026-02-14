import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAlarms } from "../api/alarm.api";
import { useAlarmsStore } from "../store/alarm.store";
import { buildAlarmsQueryParams } from "../utils/alarms.utils";

export const useAlarmsQuery = (backupId: number | string | undefined) => {
  const { queryParams, updateQueryParams, clearFilters, reset } =
    useAlarmsStore();

  const validBackupId = backupId ? Number(backupId) : null;
  const isValidBackupId = validBackupId && !isNaN(validBackupId);

  const queryKey = [
    "alarms",
    validBackupId,
    buildAlarmsQueryParams(queryParams),
  ];

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!validBackupId) {
        console.error("Alarms query: Invalid backup ID", backupId);
        throw new Error("Invalid backup ID");
      }
      console.log("Alarms query: Making API call", {
        backupId: validBackupId,
        params: queryParams,
      });
      return getAlarms(validBackupId, queryParams);
    },
    enabled: Boolean(isValidBackupId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(() => {
    const alarms = query.data?.results || [];
    const totalFromBackend = query.data?.total_results || 0;
    const activeAlarms = alarms.filter((alarm) => alarm.active).length;
    const inactiveAlarms = alarms.filter((alarm) => !alarm.active).length;
    const customRepeatAlarms = alarms.filter(
      (alarm) => alarm.repeat_type !== 0,
    ).length;
    const dailyAlarms = alarms.filter(
      (alarm) => alarm.repeat_type === 127,
    ).length;

    return {
      totalAlarms: totalFromBackend,
      activeAlarms,
      inactiveAlarms,
      customRepeatAlarms,
      dailyAlarms,
    };
  }, [query.data]);

  const refresh = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    alarms: query.data?.results || [],
    stats,
    totalResults: query.data?.total_results || 0,
    totalPages: query.data?.total_pages || 0,
    currentPage: query.data?.current_page || 1,
    hasNextPage: query.data?.has_next || false,
    hasPreviousPage: query.data?.has_previous || false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    refresh,

    queryParams,

    updateQueryParams,
    clearFilters,
    reset,
  };
};
