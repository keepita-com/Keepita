import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlarmClock } from "lucide-react";
import type { Alarm } from "../types/alarm.types";
import { cn } from "../../../../../shared/utils/cn";
import AlarmItem from "./AlarmItem";
import AlarmSkeletonList from "./AlarmSkeletonList";

interface AlarmListProps {
  alarms: Alarm[];
  isLoading?: boolean;
  isInitialLoading?: boolean;
  className?: string;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const AlarmList: React.FC<AlarmListProps> = ({
  alarms,
  isLoading = false,
  isInitialLoading = false,
  className,
  theme = "Samsung",
}) => {
  const formatNextAlarm = () => {
    const activeAlarms = alarms.filter((alarm) => alarm.active);
    if (activeAlarms.length === 0) return null;

    const sortedAlarms = activeAlarms.sort((a, b) =>
      a.time_display.localeCompare(b.time_display),
    );
    const nextAlarm = sortedAlarms[0];

    const now = new Date();
    const [hours, minutes] = nextAlarm.time_display.split(":").map(Number);
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const diff = alarmTime.getTime() - now.getTime();
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { alarm: nextAlarm, hoursUntil, minutesUntil };
  };

  const nextAlarmInfo = formatNextAlarm();

  const themes = {
    Samsung: {
      nextAlaramTimeClassNames: "text-base text-blue-900",
      nextAlaramTitleClassNames: "text-sm text-blue-600 font-medium",
      nextAlaramContainerClassNames:
        "mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200",
      listWrapperClassNames: "",
    },
    Xiaomi: {
      nextAlaramTimeClassNames: "text-base text-gray-600",
      nextAlaramTitleClassNames: "text-sm text-gray-900 font-medium",
      nextAlaramContainerClassNames:
        "mb-3 p-3 bg-gray-50 rounded-2xl border border-gray-200",
      listWrapperClassNames: "",
    },
    Apple: {
      nextAlaramTimeClassNames: "",
      nextAlaramTitleClassNames: "",
      nextAlaramContainerClassNames: "",
      listWrapperClassNames: "bg-white rounded-xl",
    },
  };

  const currentTheme = themes[theme as "Samsung" | "Xiaomi" | "Apple"];

  if (isLoading || isInitialLoading) {
    return <AlarmSkeletonList count={5} className={className} />;
  }

  return (
    <div className={cn("", className)}>
      {nextAlarmInfo && theme !== "Apple" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={currentTheme.nextAlaramContainerClassNames}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-full">
              <AlarmClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={currentTheme.nextAlaramTitleClassNames}>
                Next alarm
              </p>
              <p className={currentTheme.nextAlaramTimeClassNames}>
                {nextAlarmInfo.alarm.time_display} • in{" "}
                {nextAlarmInfo.hoursUntil}h {nextAlarmInfo.minutesUntil}m
              </p>
              {nextAlarmInfo.alarm.name && (
                <p className="text-sm text-blue-700">
                  {nextAlarmInfo.alarm.name}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className={cn("space-y-0", currentTheme.listWrapperClassNames)}>
        <AnimatePresence>
          {alarms.map((alarm, index) => (
            <motion.div
              key={alarm.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              {index > 0 && theme === "Apple" && (
                <div className="absolute inset-x-0 top-0 h-px bg-gray-200 " />
              )}
              <AlarmItem alarm={alarm} theme={theme} />
            </motion.div>
          ))}
        </AnimatePresence>

        {alarms.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <AlarmClock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No alarms found
            </h3>
            <p className="text-gray-500">This backup contains no alarm data</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AlarmList;
