import type {
  WiFiNetwork,
  SecurityType,
  ConnectionStatus,
  FrequencyBand,
  WiFiQueryParams,
} from "../types/wifi.types";
import { buildQueryParams } from "../../../../../shared/utils";

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatFrequency = (frequency: number | null): string => {
  if (!frequency) return "Unknown";

  if (frequency >= 5150 && frequency <= 5875) {
    return "5GHz";
  } else if (frequency >= 2400 && frequency <= 2500) {
    return "2.4GHz";
  } else if (frequency >= 5925 && frequency <= 7125) {
    return "6GHz";
  }

  return `${frequency}MHz`;
};

export const getSecurityStrength = (
  securityType: SecurityType,
): {
  level: string;
  color: string;
  score: number;
} => {
  switch (securityType) {
    case "NONE":
      return { level: "None", color: "red", score: 0 };
    case "WPA_PSK":
      return { level: "Low", color: "orange", score: 3 };
    case "WPA2_PSK":
      return { level: "Good", color: "green", score: 7 };
    case "WPA_EAP":
      return { level: "High", color: "green", score: 8 };
    case "WPA2_EAP":
      return { level: "Excellent", color: "green", score: 10 };
    default:
      return { level: "Unknown", color: "gray", score: 0 };
  }
};

export const getSecurityIcon = (securityType: SecurityType): string => {
  switch (securityType) {
    case "NONE":
      return "wifi-off";
    case "WPA_PSK":
    case "WPA2_PSK":
    case "WPA_EAP":
    case "WPA2_EAP":
      return "shield";
    default:
      return "shield";
  }
};

export const getConnectionStatusColor = (status: ConnectionStatus): string => {
  switch (status) {
    case "Connected":
      return "text-blue-600 bg-blue-100";
    case "Saved":
      return "text-green-600 bg-green-100";
    case "Available":
      return "text-gray-600 bg-gray-100";
    case "Failed":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getSecurityStrengthColor = (color: string): string => {
  switch (color.toLowerCase()) {
    case "green":
      return "text-green-600 bg-green-100";
    case "orange":
      return "text-orange-600 bg-orange-100";
    case "red":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getFrequencyBand = (frequency: number | null): FrequencyBand => {
  if (!frequency) return "Unknown";

  if (frequency >= 5150 && frequency <= 5875) {
    return "5GHz";
  } else if (frequency >= 2400 && frequency <= 2500) {
    return "2.4GHz";
  } else if (frequency >= 5925 && frequency <= 7125) {
    return "6GHz";
  }

  return "Unknown";
};

export const isValidSSID = (ssid: string): boolean => {
  if (!ssid || typeof ssid !== "string") return false;

  return ssid.length >= 1 && ssid.length <= 32;
};

export const isValidPassword = (
  password: string,
  securityType: SecurityType,
): boolean => {
  if (securityType === "NONE") {
    return true;
  }

  if (!password || typeof password !== "string") return false;

  if (securityType.includes("WPA")) {
    return password.length >= 8 && password.length <= 63;
  }

  return password.length > 0;
};

export const isSecureNetwork = (wifiNetwork: WiFiNetwork): boolean => {
  return wifiNetwork.security_type !== "NONE";
};

export const isHiddenNetwork = (wifiNetwork: WiFiNetwork): boolean => {
  return wifiNetwork.hidden;
};

export const isSavedNetwork = (wifiNetwork: WiFiNetwork): boolean => {
  return wifiNetwork.is_saved;
};

export const isConnectedNetwork = (wifiNetwork: WiFiNetwork): boolean => {
  return wifiNetwork.connection_status === "Connected";
};

export const isRecentlyConnected = (
  wifiNetwork: WiFiNetwork,
  daysThreshold: number = 7,
): boolean => {
  if (!wifiNetwork.last_connected) return false;

  const lastConnected = new Date(wifiNetwork.last_connected);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - daysThreshold);

  return lastConnected >= threshold;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};

export const groupBySecurityType = (
  networks: WiFiNetwork[],
): Record<SecurityType, WiFiNetwork[]> => {
  const groups = {} as Record<SecurityType, WiFiNetwork[]>;

  networks.forEach((network) => {
    if (!groups[network.security_type]) {
      groups[network.security_type] = [];
    }
    groups[network.security_type].push(network);
  });

  return groups;
};

export const groupByConnectionStatus = (
  networks: WiFiNetwork[],
): Record<ConnectionStatus, WiFiNetwork[]> => {
  const groups = {} as Record<ConnectionStatus, WiFiNetwork[]>;

  networks.forEach((network) => {
    if (!groups[network.connection_status]) {
      groups[network.connection_status] = [];
    }
    groups[network.connection_status].push(network);
  });

  return groups;
};

export const groupByFrequencyBand = (
  networks: WiFiNetwork[],
): Record<FrequencyBand, WiFiNetwork[]> => {
  const groups = {} as Record<FrequencyBand, WiFiNetwork[]>;

  networks.forEach((network) => {
    const band = getFrequencyBand(network.frequency);
    if (!groups[band]) {
      groups[band] = [];
    }
    groups[band].push(network);
  });

  return groups;
};

export const sortByStrength = (networks: WiFiNetwork[]): WiFiNetwork[] => {
  return [...networks].sort((a, b) => {
    const strengthA = getSecurityStrength(a.security_type).score;
    const strengthB = getSecurityStrength(b.security_type).score;
    return strengthB - strengthA;
  });
};

export const filterBySearch = (
  networks: WiFiNetwork[],
  query: string,
): WiFiNetwork[] => {
  if (!query || !query.trim()) return networks;

  const searchTerm = query.toLowerCase().trim();

  return networks.filter(
    (network) =>
      network.ssid.toLowerCase().includes(searchTerm) ||
      network.security_type.toLowerCase().includes(searchTerm) ||
      network.security_display.toLowerCase().includes(searchTerm),
  );
};

export const getWiFiNetworkInfo = (network: WiFiNetwork) => ({
  ssid: network.ssid,
  isSecure: isSecureNetwork(network),
  isHidden: isHiddenNetwork(network),
  isSaved: isSavedNetwork(network),
  isConnected: isConnectedNetwork(network),
  isRecentlyConnected: isRecentlyConnected(network),
  securityStrength: getSecurityStrength(network.security_type),
  frequencyBand: getFrequencyBand(network.frequency),
  connectionStatusColor: getConnectionStatusColor(network.connection_status),
  formattedDate: network.created_at ? formatDate(network.created_at) : null,
  formattedLastConnected: network.last_connected
    ? formatDate(network.last_connected)
    : null,
});

export const getWiFiStats = (networks: WiFiNetwork[]) => ({
  total: networks.length,
  secure: networks.filter(isSecureNetwork).length,
  saved: networks.filter(isSavedNetwork).length,
  connected: networks.filter(isConnectedNetwork).length,
  hidden: networks.filter(isHiddenNetwork).length,
  recentlyConnected: networks.filter(isRecentlyConnected).length,
  bySecurityType: groupBySecurityType(networks),
  byConnectionStatus: groupByConnectionStatus(networks),
  byFrequencyBand: groupByFrequencyBand(networks),
});

export const buildWifiQueryParams = (params: Partial<WiFiQueryParams>) => {
  return buildQueryParams(params);
};
