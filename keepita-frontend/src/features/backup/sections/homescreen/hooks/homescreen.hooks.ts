import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  getHomescreenLayout,
  getHomescreenLayouts,
} from "../api/homescreen.api";
import { useHomescreenStore } from "../store/homescreen.store";
import type { HomescreenQueryParams } from "../types/homescreen.types";
import { buildHomescreenQueryParams } from "../utils/homescreen.utils";

const HOMESCREEN_QUERY_KEY = "homescreen";

export const useHomescreenLayouts = (backupId: string) => {
  const { filters, searchQuery, sortConfig, currentPage } =
    useHomescreenStore();

  const queryParams: HomescreenQueryParams = {
    page: currentPage,
    page_size: 10,
    search: searchQuery || undefined,
    ordering:
      sortConfig.direction === "desc"
        ? `-${sortConfig.field}`
        : sortConfig.field,
    ...filters,
  };

  const queryKey = [
    HOMESCREEN_QUERY_KEY,
    backupId,
    buildHomescreenQueryParams(queryParams),
  ];

  const query = useQuery({
    queryKey,
    queryFn: () => getHomescreenLayouts(backupId, queryParams),
    enabled: !!backupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useHomescreenLayout = (backupId: string, layoutId: string) => {
  const query = useQuery({
    queryKey: [HOMESCREEN_QUERY_KEY, backupId, layoutId],
    queryFn: () => getHomescreenLayout(backupId, layoutId),
    enabled: !!backupId && !!layoutId,
  });

  return {
    ...query,
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useHomescreenActions = () => {
  const queryClient = useQueryClient();

  const invalidateHomescreenQueries = useCallback(
    (backupId?: string) => {
      if (backupId) {
        queryClient.invalidateQueries({
          queryKey: [HOMESCREEN_QUERY_KEY, backupId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [HOMESCREEN_QUERY_KEY],
        });
      }
    },
    [queryClient],
  );

  return {
    invalidateHomescreenQueries,
  };
};
