import type { BluetoothDeviceType } from "../types/bluetooth.types";

/**
 * Bluetooth device class constants
 */
export const BLUETOOTH_DEVICE_CLASSES = {
  // Audio/Video devices
  AUDIO_HEADSET: 2360324,
  AUDIO_SPEAKER: 2360452,
  AUDIO_MICROPHONE: 2360328,

  // Phone devices
  SMARTPHONE: 2097152,
  FEATURE_PHONE: 2097156,

  // Computer devices
  LAPTOP: 263172,
  DESKTOP: 263168,
  TABLET: 263180,

  // TV/Display devices
  TV: 6160908,
  DISPLAY: 6160904,

  // Input devices
  KEYBOARD: 1472,
  MOUSE: 1408,
  GAMEPAD: 1348,

  // Health devices
  HEALTH_THERMOMETER: 9240576,
  HEALTH_GLUCOSE: 9240584,
  HEALTH_PULSE: 9240580,
} as const;

/**
 * Bluetooth bond state constants
 */
export const BLUETOOTH_BOND_STATES = {
  NONE: 0,
  BONDING: 1,
  BONDED: 2,
} as const;

/**
 * Bluetooth link type constants
 */
export const BLUETOOTH_LINK_TYPES = {
  CLASSIC: 1,
  LOW_ENERGY: 2,
} as const;

/**
 * Device type mappings
 */
export const DEVICE_TYPE_LABELS: Record<BluetoothDeviceType, string> = {
  audio: "Audio Device",
  input: "Input Device",
  phone: "Phone",
  computer: "Computer",
  tv: "TV/Display",
  peripheral: "Peripheral",
  unknown: "Unknown Device",
};

/**
 * Device type icons
 */
export const DEVICE_TYPE_ICONS: Record<BluetoothDeviceType, string> = {
  audio: "🎧",
  input: "⌨️",
  phone: "📱",
  computer: "💻",
  tv: "📺",
  peripheral: "🖱️",
  unknown: "📶",
};

/**
 * Bond state labels
 */
export const BOND_STATE_LABELS = {
  [BLUETOOTH_BOND_STATES.NONE]: "Not Paired",
  [BLUETOOTH_BOND_STATES.BONDING]: "Pairing...",
  [BLUETOOTH_BOND_STATES.BONDED]: "Paired",
} as const;

/**
 * Link type labels
 */
export const LINK_TYPE_LABELS = {
  [BLUETOOTH_LINK_TYPES.CLASSIC]: "Classic",
  [BLUETOOTH_LINK_TYPES.LOW_ENERGY]: "Low Energy",
} as const;

/**
 * Common Bluetooth UUIDs
 */
export const BLUETOOTH_UUIDS = {
  // Service Classes
  SERIAL_PORT: "00001101-0000-1000-8000-00805f9b34fb",
  AUDIO_SOURCE: "0000110a-0000-1000-8000-00805f9b34fb",
  AUDIO_SINK: "0000110b-0000-1000-8000-00805f9b34fb",
  ADVANCED_AUDIO: "0000110e-0000-1000-8000-00805f9b34fb",
  HEADSET: "00001108-0000-1000-8000-00805f9b34fb",
  HANDS_FREE: "0000111e-0000-1000-8000-00805f9b34fb",
  OBEX_PUSH: "00001105-0000-1000-8000-00805f9b34fb",
  HUMAN_INTERFACE: "00001124-0000-1000-8000-00805f9b34fb",

  // Protocol UUIDs
  SDP: "00000001-0000-1000-8000-00805f9b34fb",
  UDP: "00000002-0000-1000-8000-00805f9b34fb",
  RFCOMM: "00000003-0000-1000-8000-00805f9b34fb",
  L2CAP: "00000100-0000-1000-8000-00805f9b34fb",
} as const;

/**
 * Samsung UI colors for different device states
 */
export const BLUETOOTH_COLORS = {
  connected: "#4CAF50", // Green
  paired: "#2196F3", // Blue
  unpaired: "#9E9E9E", // Gray
  audio: "#FF9800", // Orange
  input: "#9C27B0", // Purple
  phone: "#00BCD4", // Cyan
  computer: "#607D8B", // Blue Gray
  tv: "#795548", // Brown
  unknown: "#757575", // Gray
} as const;

/**
 * Default pagination settings
 */
export const BLUETOOTH_PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10,
} as const;

/**
 * Search and filter settings
 */
export const BLUETOOTH_SEARCH = {
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_RECENT_SEARCHES: 5,
} as const;

/**
 * Sort options for bluetooth devices
 */
export const BLUETOOTH_SORT_OPTIONS = [
  { value: "name", label: "Name", field: "name", direction: "asc" as const },
  {
    value: "address",
    label: "Address",
    field: "address",
    direction: "asc" as const,
  },
  {
    value: "last_connected",
    label: "Last Connected",
    field: "last_connected",
    direction: "desc" as const,
  },
  {
    value: "created_at",
    label: "Date Added",
    field: "created_at",
    direction: "desc" as const,
  },
] as const;

/**
 * Device type filter options with icons
 */
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

/**
 * Bond state filter options with colors
 */
export const BLUETOOTH_BOND_STATE_FILTERS = [
  {
    value: 2, // BondState.BONDED
    label: "Paired",
    color: "bg-green-500",
  },
  {
    value: 1, // BondState.BONDING
    label: "Pairing",
    color: "bg-yellow-500",
  },
  {
    value: 0, // BondState.NONE
    label: "Unpaired",
    color: "bg-gray-500",
  },
] as const;
