import type { BluetoothDeviceType } from "../types/bluetooth.types";

export const BLUETOOTH_DEVICE_CLASSES = {
  AUDIO_HEADSET: 2360324,
  AUDIO_SPEAKER: 2360452,
  AUDIO_MICROPHONE: 2360328,

  SMARTPHONE: 2097152,
  FEATURE_PHONE: 2097156,

  LAPTOP: 263172,
  DESKTOP: 263168,
  TABLET: 263180,

  TV: 6160908,
  DISPLAY: 6160904,

  KEYBOARD: 1472,
  MOUSE: 1408,
  GAMEPAD: 1348,

  HEALTH_THERMOMETER: 9240576,
  HEALTH_GLUCOSE: 9240584,
  HEALTH_PULSE: 9240580,
} as const;

export const BLUETOOTH_BOND_STATES = {
  NONE: 0,
  BONDING: 1,
  BONDED: 2,
} as const;

export const BLUETOOTH_LINK_TYPES = {
  CLASSIC: 1,
  LOW_ENERGY: 2,
} as const;

export const DEVICE_TYPE_LABELS: Record<BluetoothDeviceType, string> = {
  audio: "Audio Device",
  input: "Input Device",
  phone: "Phone",
  computer: "Computer",
  tv: "TV/Display",
  peripheral: "Peripheral",
  unknown: "Unknown Device",
};

export const DEVICE_TYPE_ICONS: Record<BluetoothDeviceType, string> = {
  audio: "🎧",
  input: "⌨️",
  phone: "📱",
  computer: "💻",
  tv: "📺",
  peripheral: "🖱️",
  unknown: "📶",
};

export const BOND_STATE_LABELS = {
  [BLUETOOTH_BOND_STATES.NONE]: "Not Paired",
  [BLUETOOTH_BOND_STATES.BONDING]: "Pairing...",
  [BLUETOOTH_BOND_STATES.BONDED]: "Paired",
} as const;

export const LINK_TYPE_LABELS = {
  [BLUETOOTH_LINK_TYPES.CLASSIC]: "Classic",
  [BLUETOOTH_LINK_TYPES.LOW_ENERGY]: "Low Energy",
} as const;

export const BLUETOOTH_UUIDS = {
  SERIAL_PORT: "00001101-0000-1000-8000-00805f9b34fb",
  AUDIO_SOURCE: "0000110a-0000-1000-8000-00805f9b34fb",
  AUDIO_SINK: "0000110b-0000-1000-8000-00805f9b34fb",
  ADVANCED_AUDIO: "0000110e-0000-1000-8000-00805f9b34fb",
  HEADSET: "00001108-0000-1000-8000-00805f9b34fb",
  HANDS_FREE: "0000111e-0000-1000-8000-00805f9b34fb",
  OBEX_PUSH: "00001105-0000-1000-8000-00805f9b34fb",
  HUMAN_INTERFACE: "00001124-0000-1000-8000-00805f9b34fb",

  SDP: "00000001-0000-1000-8000-00805f9b34fb",
  UDP: "00000002-0000-1000-8000-00805f9b34fb",
  RFCOMM: "00000003-0000-1000-8000-00805f9b34fb",
  L2CAP: "00000100-0000-1000-8000-00805f9b34fb",
} as const;

export const BLUETOOTH_COLORS = {
  connected: "#4CAF50",
  paired: "#2196F3",
  unpaired: "#9E9E9E",
  audio: "#FF9800",
  input: "#9C27B0",
  phone: "#00BCD4",
  computer: "#607D8B",
  tv: "#795548",
  unknown: "#757575",
} as const;

export const BLUETOOTH_PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10,
} as const;

export const BLUETOOTH_SEARCH = {
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_RECENT_SEARCHES: 5,
} as const;

export const BLUETOOTH_SORT_OPTIONS = [
  {
    value: "name_asc",
    label: "Name (A-Z)",
    field: "name",
    direction: "asc" as const,
  },
  {
    value: "name_desc",
    label: "Name (Z-A)",
    field: "name",
    direction: "desc" as const,
  },
  {
    value: "address_asc",
    label: "Address (A-Z)",
    field: "address",
    direction: "asc" as const,
  },
  {
    value: "address_desc",
    label: "Address (Z-A)",
    field: "address",
    direction: "desc" as const,
  },
  {
    value: "last_connected_desc",
    label: "Last Connected (Newest)",
    field: "last_connected",
    direction: "desc" as const,
  },
  {
    value: "last_connected_asc",
    label: "Last Connected (Oldest)",
    field: "last_connected",
    direction: "asc" as const,
  },
  {
    value: "created_at_desc",
    label: "Date Added (Newest)",
    field: "created_at",
    direction: "desc" as const,
  },
  {
    value: "created_at_asc",
    label: "Date Added (Oldest)",
    field: "created_at",
    direction: "asc" as const,
  },
] as const;

export const BLUETOOTH_DEVICE_TYPE_FILTERS = [
  {
    key: "audio" as BluetoothDeviceType,
    label: "Audio",
    icon: "🎧",
  },
  {
    key: "phone" as BluetoothDeviceType,
    label: "Phones",
    icon: "📱",
  },
  {
    key: "computer" as BluetoothDeviceType,
    label: "Computers",
    icon: "💻",
  },
  {
    key: "tv" as BluetoothDeviceType,
    label: "TVs",
    icon: "📺",
  },
  {
    key: "input" as BluetoothDeviceType,
    label: "Input",
    icon: "🎮",
  },
  {
    key: "peripheral" as BluetoothDeviceType,
    label: "Other",
    icon: "🔌",
  },
] as const;

export const BLUETOOTH_BOND_STATE_FILTERS = [
  {
    value: 2,
    label: "Paired",
    color: "bg-green-500",
  },
  {
    value: 1,
    label: "Pairing",
    color: "bg-yellow-500",
  },
  {
    value: 0,
    label: "Unpaired",
    color: "bg-gray-500",
  },
] as const;
