import type { GetAlarmsParams, AlarmSortConfig } from "../types/alarm.types";
import { buildQueryParams } from "../../../../../shared/utils";

export const formatAlarmTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(":");
    const hour24 = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);

    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? "PM" : "AM";

    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  } catch {
    return time;
  }
};

export const formatRepeatType = (repeatType: number): string => {
  switch (repeatType) {
    case 0:
      return "One time";
    case 127:
      return "Daily";
    case 31:
      return "Weekdays";
    case 96:
      return "Weekends";
    default:
      return "Custom";
  }
};

export const getDayAbbreviations = (repeatType: number): string[] => {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const result: string[] = [];

  for (let i = 0; i < 7; i++) {
    if (repeatType & (1 << i)) {
      result.push(days[i]);
    }
  }

  return result;
};

export const buildAlarmsQueryParams = (params: Partial<GetAlarmsParams>) => {
  return buildQueryParams(params);
};

export const sortConfigToOrdering = (sortConfig: AlarmSortConfig): string => {
  const { field, direction } = sortConfig;
  return direction === "desc" ? `-${field}` : field;
};

export const orderingToSortConfig = (ordering: string): AlarmSortConfig => {
  const isDesc = ordering.startsWith("-");
  const field = isDesc ? ordering.slice(1) : ordering;

  return {
    field: field as AlarmSortConfig["field"],
    direction: isDesc ? "desc" : "asc",
  };
};

export const isAlarmActive = (alarm: { active: boolean }): boolean => {
  return alarm.active;
};

export const getAlarmStatusColor = (active: boolean): string => {
  return active ? "text-green-600" : "text-gray-400";
};

export const getAlarmStatusBgColor = (active: boolean): string => {
  return active ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200";
};
