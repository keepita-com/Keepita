import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  type InfiniteData,
} from "@tanstack/react-query";

import type {
  useMarkAsReadResponse,
  Notification,
  useNotificationsResponse,
  useMarkAsReadReqPayload,
} from "../types/notifications.types";

import {
  getNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../api/notifications.api";
import { queryClient } from "../../../core/config/queryClient";
import { getCompatiblePageNumber } from "../../../core/utils/getCompatiblePage";

export const useNotification = (id: number) => {
  return useQuery<Notification>({
    queryKey: ["user", "notifications", id],
    queryFn: () => getNotification(id),
  });
};

export const useNotifications = () => {
  return useInfiniteQuery<useNotificationsResponse>({
    queryKey: ["user", "notifications"],
    queryFn: ({ pageParam }) =>
      getNotifications({
        page: getCompatiblePageNumber(pageParam),
      }),
    initialPageParam: 1,
    getNextPageParam: (currentPage) =>
      currentPage.has_next ? currentPage.next_page : undefined,
  });
};

export const useMarkAllAsRead = () => {
  return useMutation<useMarkAsReadResponse>({
    mutationFn: markAllAsRead,
    onMutate: () => {
      const prevData = queryClient.getQueryData<
        InfiniteData<useNotificationsResponse>
      >(["user", "notifications"]);

      if (!prevData) return;

      const updatedPages = prevData.pages.map((page) => ({
        ...page,
        results: page.results.map((notification) => ({
          ...notification,
          is_seen: true,
        })),
      }));

      queryClient.setQueryData(["user", "notifications"], {
        ...prevData,
        pages: updatedPages,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
    onError: () => {
      console.log("error");
    },
  });
};

export const useMarkAsRead = () => {
  return useMutation<useMarkAsReadResponse, Error, useMarkAsReadReqPayload>({
    mutationFn: ({ id }: useMarkAsReadReqPayload) => markAsRead(id),
    onMutate: (vars) => {
      const prevData = queryClient.getQueryData<
        InfiniteData<useNotificationsResponse>
      >(["user", "notifications"]);

      if (!prevData) return;

      const updatedPages = prevData.pages.map((page) => ({
        ...page,
        results: page.results.filter(
          (notification) => notification.id !== vars.id
        ),
      }));

      const updatedData = {
        ...prevData,
        pages: updatedPages,
      };

      queryClient.setQueryData(["user", "notifications"], updatedData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
  });
};

export const useNotificationsHistory = () => {
  return useInfiniteQuery<useNotificationsResponse>({
    queryKey: ["user", "notifications", "history"],
    queryFn: ({ pageParam }) =>
      getNotifications({
        history: true,
        page: getCompatiblePageNumber(pageParam),
      }),
    initialPageParam: 1,
    getNextPageParam: (currentPage) =>
      currentPage.has_next ? currentPage.next_page : undefined,
  });
};
