import React from "react";
import { motion } from "framer-motion";
import {
  Wifi,
  Lock,
  EyeOff,
  Signal,
  Clock,
  Shield,
  WifiOff,
} from "lucide-react";
import type { WiFiNetwork } from "../types/wifi.types";
import { cn } from "../../../../../shared/utils/cn";
import {
  getConnectionStatusColor,
  formatDate,
  isSecureNetwork,
} from "../utils/wifi.utils";

interface WiFiItemProps {
  wifiNetwork: WiFiNetwork;
  className?: string;
  onClick?: (wifiNetwork: WiFiNetwork) => void;
}

/**
 * Samsung-style WiFi network item component
 */
const WiFiItem: React.FC<WiFiItemProps> = ({
  wifiNetwork,
  className,
  onClick,
}) => {
  const getSecurityIcon = () => {
    if (!isSecureNetwork(wifiNetwork)) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    return <Shield className="w-4 h-4 text-green-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick?.(wifiNetwork)}
      className={cn(
        "bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer hover:border-blue-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Wifi className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">
                {wifiNetwork.ssid}
              </h3>
              {wifiNetwork.hidden && (
                <div title="Hidden Network">
                  <EyeOff className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              {getSecurityIcon()}
              <span>{wifiNetwork.security_display}</span>
              {wifiNetwork.frequency_display !== "Unknown" && (
                <>
                  <span>•</span>
                  <Signal className="w-3 h-3" />
                  <span>{wifiNetwork.frequency_display}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
            getConnectionStatusColor(wifiNetwork.connection_status)
          )}
        >
          {wifiNetwork.connection_status}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {/* Password */}
        {wifiNetwork.password && wifiNetwork.security_type !== "NONE" && (
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Password:</span>
            <code className="text-gray-600 px-2 py-1 rounded text-xs font-mono">
              {wifiNetwork.password}
            </code>
          </div>
        )}

        {/* Last Connected */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>Last connected: {wifiNetwork.last_connected_display}</span>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Added: {formatDate(wifiNetwork.created_at)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {wifiNetwork.is_saved && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Saved</span>
            </div>
          )}
          <div className="text-xs text-gray-500">ID: {wifiNetwork.id}</div>
        </div>

        <div className="text-xs text-gray-400">
          {wifiNetwork.status_display}
        </div>
      </div>
    </motion.div>
  );
};

export default WiFiItem;
