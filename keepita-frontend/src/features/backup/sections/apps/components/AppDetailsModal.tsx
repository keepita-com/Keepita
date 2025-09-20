import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  HardDrive,
  Package,
  Shield,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppPermissions } from "../hooks/app.hooks";
import type { App, AppPermission } from "../types/app.types";

interface AppDetailsModalProps {
  app: App | null;
  isOpen: boolean;
  onClose: () => void;
  backupId: string | number;
}

const AppDetailsModal: React.FC<AppDetailsModalProps> = ({
  app,
  isOpen,
  onClose,
  backupId,
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "permissions">(
    "details"
  );

  // Use the new hook for fetching app permissions
  const { data: permissionsResponse, isLoading: loadingPermissions } =
    useAppPermissions(backupId, app?.id || "");

  // Extract permissions from the response
  const permissions = permissionsResponse?.permissions?.results || [];

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("details");
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!app) return null;

  const formatFileSize = (sizeInMB?: number) => {
    if (!sizeInMB || sizeInMB === 0) return "Unknown";
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`;
    return `${(sizeInMB / 1024).toFixed(1)} GB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getPermissionIcon = (permission: AppPermission) => {
    const isGranted = permission.is_granted || permission.status === 0;
    const isDenied = permission.status === -1;
    const isHighRisk =
      permission.protection_level === 1 || permission.is_dangerous;
    const isMediumRisk =
      permission.protection_level === 2 ||
      permission.permission_name.includes("NETWORK") ||
      permission.permission_name.includes("INTERNET");

    if (isDenied) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    } else if (isGranted) {
      if (isHighRisk) {
        return <CheckCircle className="w-4 h-4 text-orange-600" />;
      } else if (isMediumRisk) {
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      } else {
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      }
    } else {
      return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (permission: AppPermission) => {
    const isGranted = permission.is_granted || permission.status === 0;
    const isDenied = permission.status === -1;
    const isHighRisk =
      permission.protection_level === 1 || permission.is_dangerous;

    if (isDenied) {
      return "bg-red-100 text-red-700 border-red-200";
    } else if (isGranted) {
      if (isHighRisk) {
        return "bg-orange-100 text-orange-700 border-orange-200";
      } else {
        return "bg-green-100 text-green-700 border-green-200";
      }
    } else {
      return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPermissionStatus = (permission: AppPermission) => {
    if (permission.is_granted) return "Granted";
    if (permission.status === -1) return "Denied";
    if (permission.status === 0) return "Granted";
    return "Unknown";
  };

  const formatPermissionName = (permission_name?: string) => {
    if (!permission_name) return "Unknown Permission";
    const parts = permission_name.split(".");
    const lastPart = parts[parts.length - 1];
    return lastPart
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const iconUrl = app.icon_url || app.icon;

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
            <div
              className="w-full max-w-4xl h-[85vh] bg-white shadow-xl rounded-lg flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-4">
                  {/* App Icon */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={app?.apk_name || "App"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback = target.parentElement?.querySelector(
                            ".fallback-icon"
                          ) as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                    <div className="fallback-icon hidden w-full h-full bg-gray-200 items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  {/* App Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">
                      {app?.apk_name || "Unknown App"}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        v{app?.version_name || "Unknown"}
                      </span>
                      {app?.size_mb && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {formatFileSize(app.size_mb)}
                        </span>
                      )}
                      {app?.permissions_count && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {app.permissions_count} permissions
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Close Button */}
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex-shrink-0 px-6 border-b border-gray-200">
                <div className="flex space-x-8">
                  <button
                    className={`py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                      activeTab === "details"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    <Package className="w-4 h-4" />
                    App Details
                  </button>
                  <button
                    className={`py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                      activeTab === "permissions"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("permissions")}
                  >
                    <Shield className="w-4 h-4" />
                    Permissions ({app?.permissions_count || 0})
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden p-6">
                <div className="h-full overflow-y-auto">
                  {activeTab === "details" ? (
                    <div className="space-y-6">
                      {/* App Information */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          Application Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">
                              App Name
                            </div>
                            <div className="font-medium text-gray-900">
                              {app?.apk_name || "Unknown"}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">
                              Package Name
                            </div>
                            <div className="font-mono text-sm text-gray-900 break-all">
                              {"Not available"}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">
                              Version
                            </div>
                            <div className="font-medium text-gray-900">
                              {app?.version_name || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Storage Information */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-green-600" />
                          Storage Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">
                              Total Size
                            </div>
                            <div className="font-medium text-gray-900">
                              {app?.size_mb
                                ? formatFileSize(app.size_mb)
                                : "Unknown"}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">
                              Size (Bytes)
                            </div>
                            <div className="font-mono text-sm text-gray-900">
                              {app?.size
                                ? app.size.toLocaleString() + " bytes"
                                : "Unknown"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Information */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-orange-600" />
                          Timeline
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">
                              Last Used
                            </div>
                            <div className="font-medium text-gray-900">
                              {formatDate(app?.last_time_used)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">
                              Record Created
                            </div>
                            <div className="font-medium text-gray-900">
                              {formatDate(app?.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Permissions Tab */
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-600" />
                        App Permissions
                      </h4>

                      {loadingPermissions ? (
                        <div className="space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="animate-pulse bg-gray-100 p-4 rounded-lg"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : permissions.length > 0 ? (
                        <div className="space-y-3">
                          {permissions.map((permission: AppPermission) => (
                            <div
                              key={permission.id}
                              className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="p-2 bg-white rounded-lg shadow-sm">
                                    {getPermissionIcon(permission)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 truncate">
                                      {formatPermissionName(
                                        permission.permission_name
                                      )}
                                    </h5>
                                    <p className="text-sm text-gray-600 truncate">
                                      {permission.permission_group ||
                                        "No group"}
                                    </p>
                                    <p className="text-xs text-gray-400 font-mono truncate mt-1">
                                      {permission.permission_name}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                    permission
                                  )}`}
                                >
                                  {getPermissionStatus(permission)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-gray-600 font-medium mb-2">
                            No permissions data available
                          </h3>
                          <p className="text-gray-500 text-sm">
                            This app doesn't have any recorded permissions.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AppDetailsModal;
