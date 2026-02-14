import React from "react";
import {
  Bell,
  BellOff,
  BookmarkCheck,
  CheckCheck,
  Eye,
  CalendarFold,
} from "lucide-react";
import { motion } from "framer-motion";
import ReactTimeAgo from "react-time-ago";

import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotificationsHistory,
} from "../services/notifications.sercives";

import { getNotificationStyles } from "../utils/notifications.utils";
import BackupPagination from "../../backup/components/BackupPagination";

const NotificationSkeleton = () => (
  <div className="rounded-xl border border-gray-700 p-4 bg-gray-800/30 animate-pulse">
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
        <div className="h-4 bg-gray-600 rounded w-2/3"></div>
      </div>
      <div className="h-3 bg-gray-700 rounded w-1/4 ml-1"></div>
    </div>
  </div>
);

const NotificationsPage = () => {
  const [currentPage, setCurrentPage] = React.useState(0);

  const { data, fetchNextPage, fetchPreviousPage, isLoading } =
    useNotificationsHistory();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const notifications = data?.pages?.[currentPage]?.results ?? [];

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.is_seen,
  );

  const onMarkAsReadClickHandler = (id: number) => {
    markAsRead({ id });
  };

  const markAllAsReadClickHandler = () => {
    markAllAsRead();
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col xl:pb-[30px] pb-0 justify-between">
      <div>
        <div className="flex items-center sm:flex-row flex-col gap-6 justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Bell color="white" />
            <h1 className="text-3xl text-white">All Notifications</h1>
          </div>

          {!isLoading && hasUnreadNotifications && (
            <div className="flex items-center">
              <button
                onClick={markAllAsReadClickHandler}
                className="bg-blue-800/40 p-[10px_15px] cursor-pointer rounded-full btn flex items-center gap-1.5 transition-colors hover:bg-blue-800/60"
              >
                <BookmarkCheck size={19} className="text-blue-200" />
                <p className="text-white">Mark All As Read</p>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-[30px]">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <NotificationSkeleton key={idx} />
            ))
          ) : notifications.length === 0 ? (
            <div className="w-full flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-800/50 rounded-full">
                  <BellOff color="gray" size={32} />
                </div>
                <h2 className="text-gray-400 text-xl font-medium">
                  No notifications yet
                </h2>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={notification.id}
                className="rounded-xl border border-gray-600 p-4 bg-blue-300/10 backdrop-blur-2xl"
              >
                <div className="flex sm:flex-row flex-col sm:items-center items-start justify-between">
                  <div
                    className={`flex flex-col gap-3 sm:pb-0 pb-[20px] ${
                      notification.is_seen ? "sm:w-[90%]" : "sm:w-[80%]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded-lg scale-150">
                        {getNotificationStyles(notification.title).icon}
                      </div>

                      <p className="text-white">{notification.message}</p>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <CalendarFold size={17} color="white" />
                      <p className="text-xs text-gray-400">
                        <ReactTimeAgo
                          date={new Date(notification.created_at)}
                          locale="en-US"
                        />
                      </p>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={
                      !notification.is_seen
                        ? () => onMarkAsReadClickHandler(notification.id)
                        : undefined
                    }
                    className={`flex items-center gap-1 rounded-full py-[2px] px-[7px] ${
                      notification.is_seen
                        ? "bg-green-400/30 cursor-default"
                        : "border border-blue-200/60 bg-blue-600/20 cursor-pointer transition-shadow hover:shadow-md shadow-blue-900 active:shadow-none"
                    }`}
                  >
                    <div className="flex items-end relative top-[1.5px]">
                      {notification.is_seen ? (
                        <CheckCheck size={15} color="white" />
                      ) : (
                        <Eye size={15} color="white" />
                      )}
                    </div>
                    <p className="text-white">
                      {notification.is_seen ? "seen" : "mark as complete"}
                    </p>
                  </motion.button>
                  <div />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0">
        {!isLoading && data && data?.pages?.[0]?.total_pages > 1 && (
          <motion.div
            className="col-span-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <BackupPagination
              currentPage={currentPage + 1}
              totalPages={data.pages[0].total_pages}
              onPageChange={async (page) => setCurrentPage(page - 1)}
              onPrevPage={() =>
                fetchPreviousPage().then(() =>
                  setCurrentPage((prev) => prev - 1),
                )
              }
              onNextPage={() =>
                fetchNextPage().then(() => setCurrentPage((prev) => prev + 1))
              }
              hasNextPage={
                data.pages[currentPage]
                  ? data.pages[currentPage].has_next
                  : false
              }
              hasPrevPage={
                data.pages[currentPage]
                  ? data.pages[currentPage].has_previous
                  : false
              }
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
