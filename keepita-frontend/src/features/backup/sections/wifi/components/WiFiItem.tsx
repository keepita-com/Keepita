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
  Info,
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
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const WiFiItem: React.FC<WiFiItemProps> = ({
  wifiNetwork,
  className,
  onClick,
  theme = "Samsung",
}) => {
  const wifiThemes = {
    Samsung: {
      containerClassNames:
        "bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200",
      wifiIconClassNames: "w-6 h-6 text-blue-600",
      wifiIconWrapperClassNames:
        "w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center",
      wifiOffIconClassNames: "w-4 h-4 text-red-500",
      shieldIconClassNames: "w-4 h-4 text-green-500",
      clockIconClassNames: "w-4 h-4 text-gray-400",
    },
    Xiaomi: {
      containerClassNames:
        "bg-gray-100 rounded-3xl p-4  hover:shadow-md transition-all duration-200",
      wifiIconClassNames: "w-6 h-6 text-black",
      wifiIconWrapperClassNames: "w-12 h-12  flex items-center justify-center",
      wifiOffIconClassNames: "w-4 h-4 text-orange-600",
      shieldIconClassNames: "w-4 h-4 text-orange-600",
      clockIconClassNames: "w-4 h-4 text-orange-600",
    },
    Apple: {
      containerClassNames: "bg-[#E9E9EA] rounded-2xl",
      wifiIconClassNames: "w-6 h-6 text-blue-600",
      wifiIconWrapperClassNames:
        "w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center",
      wifiOffIconClassNames: "w-4 h-4 text-red-500",
      shieldIconClassNames: "w-4 h-4 text-green-500",
      clockIconClassNames: "w-4 h-4 text-gray-400",
    },
  };
  const currentTheme = wifiThemes[theme];

  const getSecurityIcon = () => {
    if (!isSecureNetwork(wifiNetwork)) {
      return <WifiOff className={currentTheme.wifiOffIconClassNames} />;
    }
    return <Shield className={currentTheme.shieldIconClassNames} />;
  };

  if (theme === "Apple") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => onClick?.(wifiNetwork)}
        className={cn(
          currentTheme.containerClassNames,
          onClick && "cursor-pointer",
          className,
        )}
      >
        <div className="flex items-center justify-between px-16 py-8">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-black truncate">
              {wifiNetwork.ssid}
            </h3>
            <p className="text-sm mt-1 text-gray-500 font-mono truncate">
              {wifiNetwork.security_display}
            </p>
          </div>

          <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
            <span className="text-md text-gray-600">
              {wifiNetwork.connection_status}
            </span>
            <Info className="text-blue-500" size={26} />
          </div>
        </div>
        <div className="h-px bg-gray-300 ml-14 mr-14" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick?.(wifiNetwork)}
      className={cn(
        currentTheme.containerClassNames,
        onClick && "cursor-pointer hover:border-blue-200",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className={currentTheme.wifiIconWrapperClassNames}>
              <Wifi className={currentTheme.wifiIconClassNames} />
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

        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
            getConnectionStatusColor(wifiNetwork.connection_status),
          )}
        >
          {wifiNetwork.connection_status}
        </div>
      </div>

      <div className="space-y-2">
        {wifiNetwork.password && wifiNetwork.security_type !== "NONE" && (
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Password:</span>
            <code className="text-gray-600 px-2 py-1 rounded text-xs font-mono">
              {wifiNetwork.password}
            </code>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className={currentTheme.clockIconClassNames} />
          <span>Last connected: {wifiNetwork.last_connected_display}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Added: {formatDate(wifiNetwork.created_at)}</span>
        </div>
      </div>

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
