import React, { useState } from "react";
import {
  Phone,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  User,
  MoveDownLeft,
  MoveUpRight,
  ArrowUp,
  Clock,
  Calendar,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CallLog } from "../types/callLogs.types";
import { formatPhoneNumber } from "../utils/callLogs.utils";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";

interface CallLogItemProps {
  log: CallLog;
  onSelect: (log: CallLog) => void;
  index?: number;
  callLogsLength?: number;
}

const CallLogItem: React.FC<CallLogItemProps> = ({
  log,
  onSelect,
  index = 0,
  callLogsLength = 1,
}) => {
  const { theme } = useBackupTheme();
  const isApple = theme === "Apple";
  const [isExpanded, setIsExpanded] = useState(false);

  if (!log) return null;

  const displayName = log.contact_name || log.name || "Unknown";
  const displayNumber = formatPhoneNumber(log.number || "");

  const dateDisplay = log.call_date_formatted || log.date || "—";
  const durationDisplay = log.duration_display || null;

  const callType = log.type || "UNKNOWN";

  const getIconAndColor = () => {
    switch (callType) {
      case "INCOMING":
        return { Icon: PhoneIncoming, color: "text-green-600" };
      case "OUTGOING":
        return { Icon: PhoneOutgoing, color: "text-blue-600" };
      case "MISSED":
        return { Icon: PhoneMissed, color: "text-red-600" };
      default:
        return { Icon: Phone, color: "text-gray-500" };
    }
  };

  const { Icon: CallIcon, color: iconColor } = getIconAndColor();

  if (isApple) {
    const isSelected = isExpanded;

    return (
      <div className={`${isSelected ? "bg-[#F5F5F5]" : "bg-white"} `}>
        <motion.button
          layout
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full px-5 py-3.5 flex items-center justify-between text-left 
           active:bg-gray-100 transition-colors duration-150 
          ${index !== callLogsLength - 1 ? "border-b border-gray-200" : ""}`}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <CallIcon className={`w-5 h-5 ${iconColor}`} />

            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-semibold text-gray-900 leading-tight truncate">
                {displayName}
              </p>

              <p className="text-[13px] text-gray-500 mt-0.5">
                {displayNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-1">
              <Info className="w-6 h-6 text-blue-600" />
            </button>
          </div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-gray-200 bg-gray-50/40"
            >
              <div className="px-5 py-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <p className="text-[13px] text-gray-700 mt-1">
                      {dateDisplay}
                    </p>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <p className="text-[13px] text-gray-700 mt-1">
                      {displayNumber}
                    </p>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <p className="text-[13px] text-gray-700 mt-1">
                      {durationDisplay || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (theme === "Xiaomi") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onClick={() => onSelect(log)}
        className={`relative bg-gray-100 rounded-3xl ${
          index === 0
            ? "rounded-3xl rounded-b-md"
            : Number(index) + 1 === callLogsLength
              ? "rounded-b-3xl rounded-t-md"
              : "rounded-md"
        } px-4 py-3.5 mb-1 mt-2 transition-all duration-200 cursor-pointer`}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-red-200/50 flex items-center justify-center">
            <CallIcon className={`w-6 h-6 ${iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-[16px] font-semibold text-stone-700 truncate">
                {displayName}
              </h3>
              {log.contact_name && <User className="w-4 h-4 text-stone-700" />}
            </div>

            <p className="text-sm text-stone-700 font-mono">{displayNumber}</p>

            <div className="flex items-center gap-2 mt-1">
              {callType === "INCOMING" && (
                <MoveDownLeft className="size-3 text-stone-700" />
              )}
              {callType === "OUTGOING" && (
                <MoveUpRight className="size-3 text-stone-700" />
              )}
              {callType === "MISSED" && (
                <ArrowUp className="size-3 text-stone-700" />
              )}
              <p className="text-xs text-stone-700">
                {dateDisplay} {durationDisplay && `(${durationDisplay})`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(log)}
      className="bg-white rounded-2xl p-5 mb-3 border-2 border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
            <CallIcon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            <p className="text-sm text-gray-600">{displayNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{dateDisplay}</p>
          {durationDisplay && (
            <p className="text-xs text-gray-500 mt-1">({durationDisplay})</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CallLogItem;
