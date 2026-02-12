import type { GetAppParams, GetAppPermissionsParams } from "../types/app.types";
import { buildQueryParamsWithDefaults } from "../../../../../shared/utils/queryParams";

export const buildAppQueryParams = (
  params: GetAppParams,
): Record<string, any> => {
  const defaults = {
    page: 1,
    page_size: 100,
  };

  return buildQueryParamsWithDefaults(params, defaults);
};

export const buildAppPermissionsQueryParams = (
  params: GetAppPermissionsParams,
): Record<string, any> => {
  const defaults = {
    page: 1,
    page_size: 50,
  };

  return buildQueryParamsWithDefaults(params, defaults);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);

  return `${formattedSize} ${sizes[i]}`;
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

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

export const formatPermissionsCount = (count: number): string => {
  if (count === 0) return "No permissions";
  if (count === 1) return "1 permission";
  return `${count} permissions`;
};

export const formatAppCategory = (category?: string): string => {
  if (!category) return "Uncategorized";

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

export const getAppTypeText = (isSystemApp: boolean): string => {
  return isSystemApp ? "System App" : "User App";
};

export const getAppStatusText = (enabled: boolean): string => {
  return enabled ? "Enabled" : "Disabled";
};

export const formatVersion = (
  versionName?: string,
  versionCode?: number,
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

export const formatSdkVersion = (
  targetSdk?: number,
  minSdk?: number,
  compileSdk?: number,
): string => {
  const parts: string[] = [];

  if (targetSdk) parts.push(`Target: ${targetSdk}`);
  if (minSdk) parts.push(`Min: ${minSdk}`);
  if (compileSdk) parts.push(`Compile: ${compileSdk}`);

  return parts.length > 0 ? parts.join(" • ") : "Unknown SDK";
};

export const isHighRiskApp = (permissionsCount: number): boolean => {
  return permissionsCount > 10;
};

export const getAppSizeCategory = (size: number): string => {
  if (size < 1024 * 1024) return "Small";
  if (size < 50 * 1024 * 1024) return "Medium";
  if (size < 200 * 1024 * 1024) return "Large";
  return "Very Large";
};

export const generateAppSummary = (
  totalApps: number,
  systemApps: number,
  userApps: number,
  enabledApps: number,
  disabledApps: number,
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

export const filterAppsBySearch = (apps: any[], searchQuery: string): any[] => {
  if (!searchQuery.trim()) return apps;

  const query = searchQuery.toLowerCase().trim();

  return apps.filter(
    (app) =>
      app.name?.toLowerCase().includes(query) ||
      app.package_name?.toLowerCase().includes(query) ||
      app.category?.toLowerCase().includes(query),
  );
};

export const sortApps = (
  apps: any[],
  sortBy: string,
  sortOrder: "asc" | "desc",
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
