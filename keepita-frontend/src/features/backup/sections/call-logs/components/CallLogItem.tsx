import React from "react";
import {
  Phone,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  User,
} from "lucide-react";
import type { CallLog } from "../types/callLogs.types";
import {
  formatPhoneNumber,
  formatCallDate,
  formatDuration,
} from "../utils/callLogs.utils";
import { motion } from "framer-motion";

interface CallLogItemProps {
  log: CallLog;
  onSelect: (log: CallLog) => void;
}

const getCallTypeIcon = (callType: string) => {
  switch (callType) {
    case "INCOMING":
      return PhoneIncoming;
    case "OUTGOING":
      return PhoneOutgoing;
    case "MISSED":
      return PhoneMissed;
    default:
      return Phone;
  }
};

const getCallTypeColor = (callType: string): string => {
  switch (callType) {
    case "INCOMING":
      return "text-green-600";
    case "OUTGOING":
      return "text-blue-600";
    case "MISSED":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

const getCallTypeBadgeColor = (callType: string): string => {
  switch (callType) {
    case "INCOMING":
      return "bg-green-100 text-green-700";
    case "OUTGOING":
      return "bg-blue-100 text-blue-700";
    case "MISSED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const CallLogItem: React.FC<CallLogItemProps> = ({ log, onSelect }) => {
  if (!log) {
    console.warn("CallLogItem: log is null or undefined");
    return null;
  }

  const IconComponent = getCallTypeIcon(log.type);
  const iconColor = getCallTypeColor(log.type);
  const badgeColor = getCallTypeBadgeColor(log.type);

  const displayName = log.contact_name || log.name || "Unknown";
  const displayNumber = formatPhoneNumber(log.number);
  const formattedDate = formatCallDate(log.date);
  const formattedDuration =
    log.duration > 0
      ? log.duration_display || formatDuration(log.duration)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => onSelect(log)}
      className="relative bg-white rounded-2xl p-5 mb-3 border-2 border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
    >
      {/* Main Content - Balanced Layout */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        {/* Left Side - Call Info */}
        <div className="flex items-start space-x-4 flex-1 mb-3 sm:mb-0">
          {/* Call Type Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <IconComponent className={`w-6 h-6 ${iconColor}`} />
            </div>
          </div>

          {/* Call Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {displayName}
              </h3>
              {log.contact_name && <User className="w-4 h-4 text-gray-400" />}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-mono">{displayNumber}</p>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}
                >
                  {log.call_type_display || log.type}
                </span>
                {formattedDuration && (
                  <span className="text-xs text-gray-500">
                    • Duration: {formattedDuration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Date & Time Info */}
        <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start space-x-4 sm:space-x-0 sm:space-y-2 sm:ml-4">
          {/* Call Date/Time */}
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-500">Call time</p>
            <p className="text-sm font-medium text-gray-700">{formattedDate}</p>
          </div>

          {/* Contact Status Indicator */}
          <div className="flex items-center">
            <span
              className={`
                px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                ${
                  log.contact_name
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }
              `}
            >
              {log.contact_name ? "Known" : "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default CallLogItem;
