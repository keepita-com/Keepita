export const ALARM_SORT_OPTIONS = [
  { label: "Time (earliest first)", value: "time" },
  { label: "Time (latest first)", value: "-time" },
  { label: "Name (A-Z)", value: "name" },
  { label: "Name (Z-A)", value: "-name" },
  { label: "Created (newest)", value: "-created_at" },
  { label: "Created (oldest)", value: "created_at" },
] as const;

export const ALARM_STATUS_FILTERS = [
  {
    key: "active" as const,
    label: "Active Alarms",
    icon: "⏰",
    value: true,
  },
  {
    key: "inactive" as const,
    label: "Inactive Alarms",
    icon: "⏸️",
    value: false,
  },
] as const;

export const ALARM_REPEAT_FILTERS = [
  {
    value: 0,
    label: "One Time",
    icon: "🔔",
  },
  {
    value: 127,
    label: "Daily",
    icon: "📅",
  },
  {
    value: 31,
    label: "Weekdays",
    icon: "💼",
  },
  {
    value: 96,
    label: "Weekends",
    icon: "🏖️",
  },
] as const;

export const ALARM_PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100],
} as const;

export const ALARM_ANIMATIONS = {
  FAST: "150ms",
  NORMAL: "250ms",
  SLOW: "350ms",
} as const;
