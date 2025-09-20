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

const NotificationsPage = () => {
  const [currentPage, setCurrentPage] = React.useState(0);

  const { data, fetchNextPage, fetchPreviousPage, isLoading } =
    useNotificationsHistory();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const notifications = data?.pages?.[currentPage]?.results ?? [];

  const onMarkAsReadClickHandler = (id: number) => {
    markAsRead({ id });
  };

  const markAllAsReadClickHandler = () => {
    markAllAsRead();
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col xl:pb-[30px] pb-0 justify-between">
      {/* header, notifications */}
      <div>
        {/* header */}
        <div className="flex items-center sm:flex-row flex-col gap-6 justify-between">
          {/* title */}
          <div className="flex items-center gap-2 font-bold">
            <Bell color="white" />
            <h1 className="text-3xl text-white">All Notifications</h1>
          </div>
          {/* actions */}
          <div className="flex items-center">
            {/* mark-all-as-read */}
            <button
              onClick={markAllAsReadClickHandler}
              className="bg-blue-800/40 p-[10px_15px] cursor-pointer rounded-full btn flex items-center gap-1.5"
            >
              <BookmarkCheck size={19} />
              <p>Mark All As Read</p>
            </button>
          </div>
        </div>
        {/* notifications */}
        <div className="flex flex-col gap-3 mt-[30px]">
          {notifications.length === 0 ? (
            <div className="w-full flex items-center justify-center">
              <div className="flex items-center gap-2">
                <BellOff color="gray" />
                <h2 className="text-[gray] text-2xl flex">
                  There is not notification
                </h2>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification.id + notification.message + Math.random()}
                className="rounded-xl border border-gray-600 p-4 bg-blue-300/10 backdrop-blur-2xl"
              >
                <div className="flex sm:flex-row flex-col sm:items-center items-start justify-between">
                  {/* icon, message, date */}
                  <div
                    className={`flex flex-col gap-3 sm:pb-0 pb-[20px] ${
                      notification.is_seen ? "sm:w-[90%]" : "sm:w-[80%]"
                    }`}
                  >
                    {/* icon, message */}
                    <div className="flex items-center gap-3">
                      {/* icon */}
                      <div className="p-1 rounded-lg scale-150">
                        {getNotificationStyles(notification.title).icon}
                      </div>
                      {/* message */}
                      <p className="text-white">{notification.message}</p>
                    </div>
                    {/* date */}
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
                  {/* seen/unseen */}
                  <motion.button
                    type="button"
                    onClick={
                      !notification.is_seen
                        ? () => onMarkAsReadClickHandler(notification.id)
                        : undefined
                    }
                    className={`flex items-center gap-1 rounded-full py-[2px] px-[7px] cursor-pointer ${
                      notification.is_seen
                        ? "bg-green-400/30"
                        : "border border-blue-200/60 bg-blue-600/20 transition-shadow hover:shadow-md shadow-blue-900 active:shadow-none"
                    }`}
                  >
                    {/* icon */}
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
      {/* pagination */}
      <div className="fixed bottom-0 inset-x-0">
        {data && data?.pages?.[0]?.total_pages > 1 && (
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
                  setCurrentPage((prev) => prev - 1)
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
