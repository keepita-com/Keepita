import { useMemo, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getCallLogs } from "../api/callLogs.api";
import { useCallLogsStore } from "../store/callLogs.store";
import { buildCallLogsQueryParams } from "../utils/callLogs.utils";

export const useCallLogsQuery = (backupId: number | string | undefined) => {
  const { queryParams, updateQueryParams, clearFilters, reset } =
    useCallLogsStore();

  const validBackupId = backupId ? Number(backupId) : null;
  const isValidBackupId = validBackupId && !isNaN(validBackupId);

  const queryKey = [
    "call-logs",
    validBackupId,
    buildCallLogsQueryParams(queryParams),
  ];

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => {
      if (!validBackupId) {
        console.error("Call logs query: Invalid backup ID", backupId);
        throw new Error("Invalid backup ID");
      }
      console.log("Call logs query: Making API call", {
        backupId: validBackupId,
        params: { ...queryParams, page: pageParam },
      });
      return getCallLogs(validBackupId, {
        ...queryParams,
        page: pageParam as number,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.has_next) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: Boolean(isValidBackupId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const callLogs = useMemo(() => {
    return infiniteQuery.data?.pages.flatMap((page) => page.results) ?? [];
  }, [infiniteQuery.data]);

  const stats = useMemo(() => {
    const totalFromBackend = infiniteQuery.data?.pages[0]?.total_results || 0;
    const incomingCalls = callLogs.filter(
      (log) => log.type === "INCOMING",
    ).length;
    const outgoingCalls = callLogs.filter(
      (log) => log.type === "OUTGOING",
    ).length;
    const missedCalls = callLogs.filter((log) => log.type === "MISSED").length;
    const withContacts = callLogs.filter(
      (log) => log.contact_id !== null,
    ).length;

    return {
      total: totalFromBackend,
      incoming: incomingCalls,
      outgoing: outgoingCalls,
      missed: missedCalls,
      withContacts,
    };
  }, [callLogs, infiniteQuery.data]);

  const refresh = useCallback(() => {
    infiniteQuery.refetch();
  }, [infiniteQuery]);

  return {
    callLogs,
    stats,
    totalResults: stats.total,
    isLoading: infiniteQuery.isLoading,
    isFetching: infiniteQuery.isFetching,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    error: infiniteQuery.error,
    refetch: infiniteQuery.refetch,
    fetchNextPage: infiniteQuery.fetchNextPage,
    refresh,

    queryParams,

    updateQueryParams,
    clearFilters,
    reset,
  };
};
