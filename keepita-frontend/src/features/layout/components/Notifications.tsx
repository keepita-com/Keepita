import React from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import ReactTimeAgo from "react-time-ago";

import { useUnreadCount } from "../../notifications/hooks/useUnreadCount";

import {
  useMarkAllAsRead,
  useNotifications,
} from "../../notifications/services/notifications.sercives";
import { getNotificationStyles } from "../../notifications/utils/notifications.utils";

const Notifications = () => {
  const { mutate } = useMarkAllAsRead();
  const { data } = useNotifications();

  const notificationsCount = useUnreadCount();

  const markAllAsRead = React.useCallback(() => mutate(), [mutate]);

  const allNotifications = data?.pages.flatMap((p) => p.results);

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="relative flex items-center justify-center p-[1.1rem] h-7 w-7 min-h-0 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-lg cursor-pointer"
      >
        <div className="indicator">
          <Bell size={18} strokeWidth={1.5} className="text-gray-300" />
          {notificationsCount !== 0 && (
            <motion.span
              className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center bg-sky-500 text-white text-[10px] font-bold rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 17,
              }}
            >
              {notificationsCount}
            </motion.span>
          )}
        </div>
      </label>

      <div
        tabIndex={0}
        className="mt-4 dropdown-content w-72 bg-gray-900 backdrop-blur-xl shadow-xl border border-white/10 text-gray-100 rounded-2xl overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Notifications</h3>
            {notificationsCount !== 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-sky-500/20 text-sky-400 rounded-full">
                {notificationsCount} new
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-[350px] overflow-auto pr-1 ">
            {allNotifications?.map((notification) => (
              <div
                key={notification.id + Math.random()}
                className="flex relative overflow-hidden items-start gap-3 p-3 rounded-xl hover:bg-white/5 border border-white/5"
              >
                <div className="bg-gradient-to-r from-sky-500/20 to-violet-500/20 p-2 rounded-lg">
                  {getNotificationStyles(notification.title).icon}
                </div>

                <div
                  className={`absolute -top-[40px] rotate-45 -right-[20px] w-[50px] h-[200px] blur-lg ${
                    getNotificationStyles(notification.title).shinyClassName
                  }`}
                />

                <div>
                  <p className="font-medium text-[14px]">
                    {notification.message}
                  </p>

                  <p className="text-xs text-gray-400">
                    <ReactTimeAgo
                      date={new Date(notification.created_at)}
                      locale="en-US"
                    />
                  </p>
                </div>
              </div>
            ))}
          </div>

          {notificationsCount !== 0 ? (
            <div className="mt-4">
              <button
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 text-white text-sm font-medium btn hover:shadow-sm shadow-sky-400"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            </div>
          ) : (
            <p>No new notifications</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
