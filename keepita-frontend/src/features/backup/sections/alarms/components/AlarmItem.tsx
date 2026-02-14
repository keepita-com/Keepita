import React from "react";
import type { Alarm } from "../types/alarm.types";
import { cn } from "../../../../../shared/utils/cn";

interface AlarmItemProps {
  alarm: Alarm;
  className?: string;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const AlarmItem: React.FC<AlarmItemProps> = ({
  alarm,
  className,
  theme = "Samsung",
}) => {
  const formatAppleTime = (timeDisplay: string) => {
    const [hours, minutes] = timeDisplay.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayTime = `${displayHours}:${String(minutes).padStart(2, "0")}`;
    return { displayTime, ampm };
  };

  const { displayTime: appleTime, ampm: appleAmPm } =
    theme === "Apple"
      ? formatAppleTime(alarm.time_display)
      : { displayTime: "", ampm: "" };

  const isDaily = alarm.repeat_type === 127;

  const alarmItemTheme = {
    Samsung: {
      containerClassNames:
        "flex items-center justify-between py-4 px-0 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200",
      inActiveClassNames: "opacity-75",
      statusElement: (
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full",
            alarm.active
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-500",
          )}
        >
          {alarm.active ? "Active" : "Inactive"}
        </span>
      ),
      customDays: (
        <div className="flex gap-1 mt-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
            const isSelected = (alarm.repeat_type & (1 << index)) !== 0;
            return (
              <div
                key={index}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  "border",
                  isSelected
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-transparent text-gray-400 border-gray-300",
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
      ),
      statusIndicator: (
        <div className="ml-4">
          <div
            className={cn(
              "w-12 h-6 rounded-full flex items-center justify-center text-xs font-medium",
              alarm.active
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-600",
            )}
          >
            {alarm.active ? "ON" : "OFF"}
          </div>
        </div>
      ),
    },
    Xiaomi: {
      containerClassNames:
        "flex items-center justify-between px-5 py-6 mb-4 rounded-3xl bg-white hover:bg-gray-50 transition-colors duration-200 ",
      inActiveClassNames: "opacity-75",
      statusElement: null,
      customDays: (
        <div className="flex gap-1.5 mt-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day, index) => {
              const isSelected = (alarm.repeat_type & (1 << index)) !== 0;
              if (!isSelected) return null;
              return (
                <div
                  key={index}
                  className={cn(
                    " flex items-center justify-center text-sm font-medium",
                    " text-gray-500",
                  )}
                >
                  {day}
                </div>
              );
            },
          )}
        </div>
      ),
      statusIndicator: (
        <div className="ml-4">
          <input
            checked={alarm.active}
            type="checkbox"
            className="toggle  bg-gray-300 text-white  checked:bg-blue-600 checked:text-white cursor-auto"
            readOnly
          />
        </div>
      ),
    },
    Apple: {
      containerClassNames: "flex items-center justify-between py-5 px-6 ",
      inActiveClassNames: "text-gray-400",
      statusElement: null,
      customDays: null,
      statusIndicator: (
        <div className="ml-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={alarm.active}
              readOnly
            />
            <div className="w-11 h-6 bg-[#B9B9BB] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      ),
    },
  };

  const currentTheme = alarmItemTheme[theme as "Samsung" | "Xiaomi" | "Apple"];

  const getRepeatDisplay = (repeatTypeDisplay: string) => {
    if (repeatTypeDisplay.includes("Custom")) {
      return "Custom";
    }
    return repeatTypeDisplay;
  };

  const repeatPettern = getRepeatDisplay(alarm.repeat_type_display);

  let repeatLabel = repeatPettern;

  if (isDaily) {
    repeatLabel = "Daily";
  } else if (theme === "Xiaomi" && repeatPettern === "Every day") {
    repeatLabel = "Daily";
  }

  const appleLabel = [alarm.name, repeatLabel].filter(Boolean).join(", ");

  return (
    <div
      className={cn(
        currentTheme.containerClassNames,
        !alarm.active && currentTheme.inActiveClassNames,
        className,
      )}
    >
      <div className="flex-1">
        {theme === "Apple" ? (
          <>
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "text-6xl  tracking-tight",
                  alarm.active ? "text-black" : "text-gray-400",
                )}
              >
                {appleTime}
              </span>
              <span
                className={cn(
                  "text-3xl font-light",
                  alarm.active ? "text-black" : "text-gray-400",
                )}
              >
                {appleAmPm}
              </span>
            </div>
            <div
              className={cn(
                "text-base",
                alarm.active ? "text-black" : "text-gray-400",
              )}
            >
              <span>{appleLabel}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1 mb-1">
              <span
                className={cn(
                  "text-4xl font-light tracking-wide",
                  alarm.active ? "text-gray-900" : "text-gray-400",
                )}
              >
                {alarm.time_display}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              {alarm.name && (
                <span className="font-medium text-gray-700">{alarm.name}</span>
              )}
              <span className="flex items-center gap-1">
                <span>{repeatLabel}</span>
              </span>
              {currentTheme.statusElement}
            </div>
          </>
        )}

        {alarm.repeat_type !== 0 && !isDaily && currentTheme.customDays}
      </div>

      {currentTheme.statusIndicator}
    </div>
  );
};

export default AlarmItem;
