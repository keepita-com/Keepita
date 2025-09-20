import React from "react";

import { useNotifications } from "../services/notifications.sercives";

export const useUnreadCount = () => {
  const { data } = useNotifications();

  const notificationsCount = React.useMemo(
    () => data?.pages[0]?.result_count,
    [data]
  );

  return notificationsCount;
};
