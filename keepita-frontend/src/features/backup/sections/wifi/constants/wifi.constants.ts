import type { SecurityType, FrequencyBand } from "../types/wifi.types";

export const WIFI_SORT_OPTIONS = [
  { key: "created_at", label: "Date Added", direction: "desc" },
  { key: "created_at", label: "Date Added (Oldest)", direction: "asc" },
  { key: "last_connected", label: "Last Connected", direction: "desc" },
  { key: "last_connected", label: "Last Connected (Oldest)", direction: "asc" },
  { key: "ssid", label: "Network Name (A-Z)", direction: "asc" },
  { key: "ssid", label: "Network Name (Z-A)", direction: "desc" },
  { key: "security_type", label: "Security Type", direction: "asc" },
] as const;

export const WIFI_SECURITY_TYPE_FILTERS = [
  {
    key: "WPA2_PSK" as SecurityType,
    label: "WPA2",
    icon: "🔐",
    description: "WPA2 Personal Security",
  },
  {
    key: "WPA_PSK" as SecurityType,
    label: "WPA",
    icon: "🔒",
    description: "WPA Personal Security",
  },
  {
    key: "NONE" as SecurityType,
    label: "Open",
    icon: "📶",
    description: "No Security (Open Network)",
  },
] as const;

export const WIFI_FREQUENCY_BAND_FILTERS = [
  {
    key: "2.4GHz" as FrequencyBand,
    label: "2.4 GHz",
    icon: "📡",
    description: "2.4 GHz Band - Longer range, lower speed",
  },
  {
    key: "5GHz" as FrequencyBand,
    label: "5 GHz",
    icon: "🚀",
    description: "5 GHz Band - Shorter range, higher speed",
  },
  {
    key: "6GHz" as FrequencyBand,
    label: "6 GHz",
    icon: "⚡",
    description: "6 GHz Band - Latest Wi-Fi 6E standard",
  },
] as const;

export const WIFI_STATUS_FILTERS = [
  {
    key: "is_saved",
    label: "Saved Networks",
    icon: "💾",
    color: "green",
    description: "Networks saved on the device",
  },
  {
    key: "hidden",
    label: "Hidden Networks",
    icon: "👁️‍🗨️",
    color: "purple",
    description: "Networks that don't broadcast SSID",
  },
] as const;

export const WIFI_CONNECTION_STATUS = {
  CONNECTED: "Connected",
  SAVED: "Saved",
  AVAILABLE: "Available",
  FAILED: "Failed",
} as const;

export const WIFI_EXPORT_FORMATS = [
  {
    key: "csv",
    label: "CSV",
    description: "Comma-separated values format",
    mimeType: "text/csv",
    extension: ".csv",
  },
  {
    key: "json",
    label: "JSON",
    description: "JavaScript Object Notation format",
    mimeType: "application/json",
    extension: ".json",
  },
] as const;

export const WIFI_PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

export const WIFI_CACHE_SETTINGS = {
  STALE_TIME: 5 * 60 * 1000,
  GC_TIME: 10 * 60 * 1000,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
} as const;
