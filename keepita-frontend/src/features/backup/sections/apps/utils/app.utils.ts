import type { GetAppParams, GetAppPermissionsParams } from "../types/app.types";
import { buildQueryParamsWithDefaults } from "../../../../../shared/utils/queryParams";

/**
 * Build query parameters for app API requests, filtering out undefined values
 */
export const buildAppQueryParams = (
  params: GetAppParams
): Record<string, any> => {
  const defaults = {
    page: 1,
    page_size: 100,
  };

  return buildQueryParamsWithDefaults(params, defaults);
};

/**
 * Build query parameters for app permissions API requests, filtering out undefined values
 */
export const buildAppPermissionsQueryParams = (
  params: GetAppPermissionsParams
): Record<string, any> => {
  const defaults = {
    page: 1,
    page_size: 50,
  };

  return buildQueryParamsWithDefaults(params, defaults);
};

/**
 * Utility functions for app management
 */

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);

  return `${formattedSize} ${sizes[i]}`;
};

/**
 * Format date string to human readable format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If it's today
    if (diffInDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    // If it's within the last week
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    // If it's within the current year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    // Otherwise, show full date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "Unknown date";
  }
};

/**
 * Format app permissions count for display
 */
export const formatPermissionsCount = (count: number): string => {
  if (count === 0) return "No permissions";
  if (count === 1) return "1 permission";
  return `${count} permissions`;
};

/**
 * Get app category display name
 */
export const formatAppCategory = (category?: string): string => {
  if (!category) return "Uncategorized";

  // Convert from CATEGORY_CONSTANT to readable format
  const categoryMap: Record<string, string> = {
    CATEGORY_GAME: "Games",
    CATEGORY_AUDIO: "Audio",
    CATEGORY_VIDEO: "Video",
    CATEGORY_IMAGE: "Image",
    CATEGORY_SOCIAL: "Social",
    CATEGORY_NEWS: "News",
    CATEGORY_MAPS: "Maps",
    CATEGORY_PRODUCTIVITY: "Productivity",
    CATEGORY_ACCESSIBILITY: "Accessibility",
    CATEGORY_SYSTEM: "System",
    CATEGORY_UNDEFINED: "Uncategorized",
  };

  return (
    categoryMap[category] || category.replace("CATEGORY_", "").toLowerCase()
  );
};

/**
 * Get app type display text
 */
export const getAppTypeText = (isSystemApp: boolean): string => {
  return isSystemApp ? "System App" : "User App";
};

/**
 * Get app status display text
 */
export const getAppStatusText = (enabled: boolean): string => {
  return enabled ? "Enabled" : "Disabled";
};

/**
 * Format version information
 */
export const formatVersion = (
  versionName?: string,
  versionCode?: number
): string => {
  if (versionName && versionCode) {
    return `${versionName} (${versionCode})`;
  }
  if (versionName) {
    return versionName;
  }
  if (versionCode) {
    return `Build ${versionCode}`;
  }
  return "Unknown version";
};

/**
 * Format SDK version information
 */
export const formatSdkVersion = (
  targetSdk?: number,
  minSdk?: number,
  compileSdk?: number
): string => {
  const parts: string[] = [];

  if (targetSdk) parts.push(`Target: ${targetSdk}`);
  if (minSdk) parts.push(`Min: ${minSdk}`);
  if (compileSdk) parts.push(`Compile: ${compileSdk}`);

  return parts.length > 0 ? parts.join(" • ") : "Unknown SDK";
};

/**
 * Determine if an app is potentially dangerous based on permissions
 */
export const isHighRiskApp = (permissionsCount: number): boolean => {
  return permissionsCount > 10; // Apps with more than 10 permissions might be risky
};

/**
 * Get app size category
 */
export const getAppSizeCategory = (size: number): string => {
  if (size < 1024 * 1024) return "Small"; // < 1MB
  if (size < 50 * 1024 * 1024) return "Medium"; // < 50MB
  if (size < 200 * 1024 * 1024) return "Large"; // < 200MB
  return "Very Large"; // >= 200MB
};

/**
 * Generate app summary text
 */
export const generateAppSummary = (
  totalApps: number,
  systemApps: number,
  userApps: number,
  enabledApps: number,
  disabledApps: number
): string => {
  const parts: string[] = [];

  parts.push(`${totalApps} total app${totalApps !== 1 ? "s" : ""}`);

  if (userApps > 0) {
    parts.push(`${userApps} user`);
  }

  if (systemApps > 0) {
    parts.push(`${systemApps} system`);
  }

  if (enabledApps > 0 && enabledApps < totalApps) {
    parts.push(`${enabledApps} enabled`);
  }

  if (disabledApps > 0) {
    parts.push(`${disabledApps} disabled`);
  }

  return parts.join(" • ");
};

/**
 * Filter apps based on search query
 */
export const filterAppsBySearch = (apps: any[], searchQuery: string): any[] => {
  if (!searchQuery.trim()) return apps;

  const query = searchQuery.toLowerCase().trim();

  return apps.filter(
    (app) =>
      app.name?.toLowerCase().includes(query) ||
      app.package_name?.toLowerCase().includes(query) ||
      app.category?.toLowerCase().includes(query)
  );
};

/**
 * Sort apps based on criteria
 */
export const sortApps = (
  apps: any[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): any[] => {
  const sorted = [...apps].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "name":
        aValue = a.name?.toLowerCase() || "";
        bValue = b.name?.toLowerCase() || "";
        break;
      case "package_name":
        aValue = a.package_name?.toLowerCase() || "";
        bValue = b.package_name?.toLowerCase() || "";
        break;
      case "size":
        aValue = a.size || 0;
        bValue = b.size || 0;
        break;
      case "permissions_count":
        aValue = a.permissions_count || 0;
        bValue = b.permissions_count || 0;
        break;
      case "version":
        aValue = a.version_name || a.version_code || "";
        bValue = b.version_name || b.version_code || "";
        break;
      case "last_updated":
        aValue = new Date(a.last_updated || 0).getTime();
        bValue = new Date(b.last_updated || 0).getTime();
        break;
      case "install_date":
        aValue = new Date(a.install_date || 0).getTime();
        bValue = new Date(b.install_date || 0).getTime();
        break;
      default:
        aValue = a.name?.toLowerCase() || "";
        bValue = b.name?.toLowerCase() || "";
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return sorted;
};
