import { PhoneMissed, User, PhoneIncoming, PhoneOutgoing } from "lucide-react";

export const CALL_LOGS_COLORS = {
  INCOMING: {
    primary: "#1976D2",
    background: "#E3F2FD",
    hover: "#1565C0",
  },
  OUTGOING: {
    primary: "#388E3C",
    background: "#E8F5E8",
    hover: "#2E7D32",
  },
  MISSED: {
    primary: "#D32F2F",
    background: "#FFEBEE",
    hover: "#C62828",
  },

  TEXT: {
    primary: "#1C1C1E",
    secondary: "#8E8E93",
    tertiary: "#C7C7CC",
  },
  BACKGROUND: {
    primary: "#FFFFFF",
    secondary: "#F2F2F7",
    tertiary: "#F9F9F9",
  },
  DIVIDER: "#E5E5EA",
  SHADOW: "rgba(0, 0, 0, 0.1)",
} as const;

export const CALL_LOGS_TYPOGRAPHY = {
  HEADING: {
    fontSize: "28px",
    fontWeight: "700",
    lineHeight: "34px",
  },
  SUBHEADING: {
    fontSize: "20px",
    fontWeight: "600",
    lineHeight: "25px",
  },
  BODY_LARGE: {
    fontSize: "17px",
    fontWeight: "400",
    lineHeight: "22px",
  },
  BODY_MEDIUM: {
    fontSize: "15px",
    fontWeight: "400",
    lineHeight: "20px",
  },
  BODY_SMALL: {
    fontSize: "13px",
    fontWeight: "400",
    lineHeight: "18px",
  },
  CAPTION: {
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "16px",
  },
} as const;

export const CALL_LOGS_SPACING = {
  XS: "4px",
  SM: "8px",
  MD: "12px",
  LG: "16px",
  XL: "20px",
  XXL: "24px",
  XXXL: "32px",
} as const;

export const CALL_LOGS_BORDER_RADIUS = {
  SM: "8px",
  MD: "12px",
  LG: "16px",
  XL: "20px",
  ROUND: "50%",
} as const;

export const CALL_TYPE_LABELS = {
  INCOMING: "Incoming",
  OUTGOING: "Outgoing",
  MISSED: "Missed",
} as const;

export const CALL_TYPE_ICONS = {
  INCOMING: "call_received",
  OUTGOING: "call_made",
  MISSED: "call_missed",
} as const;

export const CALL_LOG_SORT_OPTIONS = [
  { label: "Most Recent", value: "-date" },
  { label: "Oldest First", value: "date" },
  { label: "Duration (High to Low)", value: "-duration" },
  { label: "Duration (Low to High)", value: "duration" },
] as const;

export const CALL_LOG_BOOLEAN_FILTERS = [
  { key: "has_contact", label: "Has Contact", icon: User },
] as const;

export const CALL_LOG_TYPE_FILTERS = [
  { value: "INCOMING", label: "Incoming", icon: PhoneIncoming },
  { value: "OUTGOING", label: "Outgoing", icon: PhoneOutgoing },
  { value: "MISSED", label: "Missed", icon: PhoneMissed },
] as const;

export const CALL_LOGS_ANIMATIONS = {
  FAST: "150ms",
  NORMAL: "250ms",
  SLOW: "350ms",
  SPRING: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  EASE_OUT: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
} as const;

export const CALL_LOGS_HEIGHTS = {
  ITEM: "72px",
  ITEM_COMPACT: "56px",
  HEADER: "56px",
  SEARCH_BAR: "48px",
  BUTTON: "48px",
  BUTTON_SMALL: "36px",
} as const;

export const CALL_LOGS_PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200],
  INFINITE_SCROLL_THRESHOLD: 100,
} as const;

export const CALL_LOGS_EXPORT_FORMATS = [
  { value: "csv", label: "CSV File", extension: ".csv" },
  { value: "json", label: "JSON File", extension: ".json" },
  { value: "pdf", label: "PDF Report", extension: ".pdf" },
] as const;

export const CALL_LOGS_SHADOWS = {
  CARD: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
  ELEVATED: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
  MODAL: "0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)",
} as const;

export const CALL_LOGS_FEATURES = {
  INFINITE_SCROLL: true,
  EXPORT_FUNCTIONALITY: true,
  BULK_OPERATIONS: true,
  ADVANCED_FILTERS: true,
  REAL_TIME_SEARCH: true,
  TIMELINE_VIEW: true,
} as const;
