import React, { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone } from "lucide-react";
import CallLogItem from "./CallLogItem";
import type { CallLog } from "../types/callLogs.types";
import CallLogSkeletonList from "./CallLogSkeletonList";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";

interface CallLogListProps {
  callLogs: CallLog[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  onCallLogSelect: (callLog: CallLog) => void;
  error?: string | null;
}

const CallLogList: React.FC<CallLogListProps> = ({
  callLogs,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  onCallLogSelect,
  error = null,
}) => {
  const observer = useRef<IntersectionObserver>(null);
  const { theme } = useBackupTheme();

  const lastCallLogRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-2xl p-6"
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-red-900">
              Failed to load call logs
            </h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!callLogs?.length) {
    const iconColor = theme === "Samsung" ? "text-gray-400" : "text-stone-700";
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Phone className={iconColor} size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No call logs found
        </h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          There are no call logs to display. Check your search criteria or try
          again later.
        </p>
      </motion.div>
    );
  }

  const wrapperClass =
    theme === "Xiaomi"
      ? "space-y-2 bg-red-100"
      : theme === "Apple"
        ? "space-y-2 bg-white"
        : "space-y-2";

  return (
    <div className={wrapperClass}>
      <AnimatePresence>
        {callLogs.map((callLog, index) => {
          if (!callLog?.id) {
            console.warn("Invalid call log item:", callLog);
            return null;
          }

          const isLast = index === callLogs.length - 1;
          return (
            <motion.div
              key={callLog.id}
              ref={isLast ? lastCallLogRef : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <CallLogItem
                log={callLog}
                callLogsLength={callLogs.length}
                index={index}
                onSelect={onCallLogSelect}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {isFetchingNextPage && <CallLogSkeletonList count={5} />}

      {!hasNextPage && callLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-sm text-gray-500">
            You've reached the end of the call logs
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CallLogList;
