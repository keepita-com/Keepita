import React, { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone } from "lucide-react";
import CallLogItem from "./CallLogItem";
import type { CallLog } from "../types/callLogs.types";
import CallLogSkeletonList from "./CallLogSkeletonList";

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

  const lastCallLogRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Error State
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

  // Empty State
  if (!callLogs || callLogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Phone className="text-gray-400" size={32} />
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

  // Simple list without grouping
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {callLogs.map((callLog, index) => {
          // Safety check for each call log item
          if (!callLog || !callLog.id) {
            console.warn("Invalid call log item:", callLog);
            return null;
          }

          const isLast = index === callLogs.length - 1;
          return (
            <motion.div
              key={callLog.id}
              ref={isLast ? lastCallLogRef : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <CallLogItem log={callLog} onSelect={onCallLogSelect} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Loading indicator for infinite scroll */}
      {isFetchingNextPage && <CallLogSkeletonList count={5} />}

      {/* End of list indicator */}
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
