import React from "react";

import { useNotifications } from "../services/notifications.sercives";

export const useUnreadCount = () => {
  const { data } = useNotifications();

  const notificationsCount = React.useMemo(() => {
    if (!data) return 0;
    return data.pages
      .flatMap((page) => page.results)
      .filter((notification) => !notification.is_seen).length;
  }, [data]);

  return notificationsCount;
};
