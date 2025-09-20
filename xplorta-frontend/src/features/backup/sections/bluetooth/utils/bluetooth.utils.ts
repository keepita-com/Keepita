import type {
  BluetoothDevice,
  BluetoothDeviceType,
  GroupedBluetoothDevices,
  GetBluetoothDevicesParams,
} from "../types/bluetooth.types";
import { BondState, LINK_TYPE } from "../types/bluetooth.types";
import { buildQueryParams } from "../../../../../shared/utils";

/**
 * Format bluetooth device name for display
 */
export const formatDeviceName = (device: BluetoothDevice): string => {
  if (!device.name || device.name.trim() === "") {
    return "Unknown Device";
  }

  // Handle long encoded names
  if (device.name.length > 50) {
    return device.name.substring(0, 47) + "...";
  }

  return device.name;
};

/**
 * Format MAC address for display
 */
export const formatMacAddress = (address: string): string => {
  // Ensure proper MAC address format (XX:XX:XX:XX:XX:XX)
  const cleanAddress = address.replace(/[^a-fA-F0-9]/g, "");
  if (cleanAddress.length === 12) {
    return cleanAddress.match(/.{2}/g)?.join(":").toUpperCase() || address;
  }
  return address.toUpperCase();
};

/**
 * Format last connected time for display
 */
export const formatLastConnected = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "Today";
  } else if (diffDays === 2) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays - 1} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor((diffDays - 1) / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor((diffDays - 1) / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Format bond state for display
 */
export const formatBondState = (bondState: number): string => {
  switch (bondState) {
    case BondState.NONE:
      return "Not Paired";
    case BondState.BONDING:
      return "Pairing...";
    case BondState.BONDED:
      return "Paired";
    default:
      return "Unknown";
  }
};

/**
 * Format link type for display
 */
export const formatLinkType = (linkType: number): string => {
  switch (linkType) {
    case LINK_TYPE.CLASSIC:
      return "Classic";
    case LINK_TYPE.LOW_ENERGY:
      return "Low Energy";
    default:
      return "Unknown";
  }
};

/**
 * Format UUIDs for display
 */
export const formatUUIDs = (uuids: string): string[] => {
  if (!uuids) return [];
  return uuids.split(",").filter((uuid) => uuid.trim() !== "");
};

/**
 * Get device type from device class
 */
export const getDeviceType = (deviceClass: number): BluetoothDeviceType => {
  // Check specific device classes first (based on actual data)
  switch (deviceClass) {
    case 0x5e020c: // 6160908 - TV devices
      return "tv";
    case 0x5a020c: // 5898764 - Phone devices
      return "phone";
    case 2360324: // Known audio device class
    case 2360452: // Another known audio device class
      return "audio";
  }

  // Fall back to major device class detection
  const majorClass = (deviceClass >> 8) & 0x1f;

  switch (majorClass) {
    case 0x01: // Computer
      return "computer";
    case 0x02: // Phone (but check specific classes first)
      return "phone";
    case 0x04: // Audio/Video
      return "audio";
    case 0x05: // Peripheral (input devices)
      return "input";
    case 0x06: // Imaging
      return "peripheral";
    case 0x08: // Wearable
      return "peripheral";
    case 0x09: // Toy
      return "peripheral";
    case 0x0a: // Health
      return "peripheral";
    default:
      return "unknown";
  }
};

/**
 * Get device icon based on type
 */
export const getDeviceIcon = (device: BluetoothDevice): string => {
  const deviceType = getDeviceType(device.device_class);

  switch (deviceType) {
    case "audio":
      return "🎧";
    case "phone":
      return "📱";
    case "computer":
      return "💻";
    case "input":
      return "⌨️";
    case "tv":
      return "📺";
    case "peripheral":
      return "🖱️";
    default:
      return "📶";
  }
};

/**
 * Check if device is an audio device
 */
export const isAudioDevice = (device: BluetoothDevice): boolean => {
  return getDeviceType(device.device_class) === "audio";
};

/**
 * Check if device is paired
 */
export const isPaired = (device: BluetoothDevice): boolean => {
  return device.bond_state === BondState.BONDED;
};

/**
 * Check if device was recently connected
 */
export const isRecentlyConnected = (
  device: BluetoothDevice,
  daysThreshold: number = 7
): boolean => {
  const lastConnected = new Date(device.last_connected);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - daysThreshold);
  return lastConnected >= threshold;
};

/**
 * Group devices by type
 */
export const groupByType = (
  devices: BluetoothDevice[]
): GroupedBluetoothDevices => {
  const groups: GroupedBluetoothDevices = {};

  devices.forEach((device) => {
    const deviceType = getDeviceType(device.device_class);
    if (!groups[deviceType]) {
      groups[deviceType] = [];
    }
    groups[deviceType].push(device);
  });

  return groups;
};

/**
 * Group devices by bond state
 */
export const groupByBondState = (
  devices: BluetoothDevice[]
): GroupedBluetoothDevices => {
  const groups: GroupedBluetoothDevices = {
    paired: [],
    unpaired: [],
  };

  devices.forEach((device) => {
    if (device.bond_state === BondState.BONDED) {
      groups.paired.push(device);
    } else {
      groups.unpaired.push(device);
    }
  });

  return groups;
};

/**
 * Group devices by connection recency
 */
export const groupByRecency = (
  devices: BluetoothDevice[]
): GroupedBluetoothDevices => {
  const groups: GroupedBluetoothDevices = {
    recent: [],
    older: [],
  };

  devices.forEach((device) => {
    if (isRecentlyConnected(device)) {
      groups.recent.push(device);
    } else {
      groups.older.push(device);
    }
  });

  return groups;
};

/**
 * Validate MAC address format
 */
export const isValidMacAddress = (address: string): boolean => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(address);
};

/**
 * Validate device name
 */
export const isValidDeviceName = (name: string): boolean => {
  return Boolean(name && name.trim().length > 0 && name.trim().length <= 248); // Bluetooth name max length
};

/**
 * Check if device has valid UUIDs
 */
export const hasValidUUIDs = (device: BluetoothDevice): boolean => {
  if (!device.uuids) return false;
  const uuids = formatUUIDs(device.uuids);
  return uuids.length > 0;
};

/**
 * Validate device class
 */
export const isValidDeviceClass = (deviceClass: number): boolean => {
  return deviceClass >= 0 && deviceClass <= 0xffffff; // 24-bit value
};

/**
 * Get comprehensive device info
 */
export const getDeviceInfo = (device: BluetoothDevice) => ({
  name: formatDeviceName(device),
  address: formatMacAddress(device.address),
  type: getDeviceType(device.device_class),
  icon: getDeviceIcon(device),
  bondState: formatBondState(device.bond_state),
  linkType: formatLinkType(device.link_type),
  lastConnected: formatLastConnected(device.last_connected),
  uuids: formatUUIDs(device.uuids),
  isPaired: isPaired(device),
  isAudio: isAudioDevice(device),
  isRecentlyConnected: isRecentlyConnected(device),
});

/**
 * Get device statistics
 */
export const getDeviceStats = (devices: BluetoothDevice[]) => ({
  total: devices.length,
  paired: devices.filter((d) => isPaired(d)).length,
  audio: devices.filter((d) => isAudioDevice(d)).length,
  recent: devices.filter((d) => isRecentlyConnected(d)).length,
  byType: groupByType(devices),
});

/**
 * Build query parameters for bluetooth API call
 */
export const buildBluetoothQueryParams = (
  params: Partial<GetBluetoothDevicesParams>
) => {
  return buildQueryParams(params);
};
