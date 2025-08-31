import type {
  useMarkAsReadResponse,
  Notification,
  useNotificationsResponse,
} from "../types/notifications.types";
import type { ApiPage } from "../../../core/utils/getCompatiblePage";

import { DataProvider } from "../../../core/api/dataProvider";

export const getNotification = async (id: number) => {
  const response = await DataProvider.get<Notification>(
    `dashboard/notifications/${id}/`
  );

  return response.data;
};

export const getNotifications = async ({
  page = "1",
  history,
}: {
  page: ApiPage;
  history?: boolean;
}) => {
  const response = await DataProvider.get<useNotificationsResponse>(
    `dashboard/notifications/${history ? "history/" : ""}`,
    {
      params: { page },
    }
  );

  return response.data;
};

export const markAsRead = async (id: number) => {
  const response = await DataProvider.post<useMarkAsReadResponse>(
    `dashboard/notifications/${id}/mark_as_seen/`
  );

  return response.data;
};

export const markAllAsRead = async () => {
  const response = await DataProvider.post<useMarkAsReadResponse>(
    "dashboard/notifications/mark_all_as_seen/"
  );

  return response.data;
};
