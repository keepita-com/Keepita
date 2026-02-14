import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Wifi,
  Shield,
  EyeOff,
  Lock,
  Clock,
  Smartphone,
  Signal,
  Copy,
  CheckCircle,
} from "lucide-react";
import type { WiFiNetwork } from "../types/wifi.types";
import { cn } from "../../../../../shared/utils/cn";
import {
  getSecurityStrengthColor,
  formatDate,
  copyToClipboard,
} from "../utils/wifi.utils";

interface WiFiDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wifiNetwork: WiFiNetwork | null;
  isLoading?: boolean;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const WiFiDetailsModal: React.FC<WiFiDetailsModalProps> = ({
  isOpen,
  onClose,
  wifiNetwork,
  isLoading = false,
  theme = "Samsung",
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const handleCopyToClipboard = async (text: string, fieldName: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  if (!isOpen) return null;

  const detailsTheme = {
    Samsung: {
      networkIconClassNames: "w-5 h-5 text-blue-600",
      networkIconWrapperClassNames:
        "w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center",
      shieldIconClassNames: "w-4 h-4 text-green-600",
      lockIconClassNames: "w-4 h-4 text-red-600",
    },
    Xiaomi: {
      networkIconClassNames: "w-6 h-6 text-orange-600",
      networkIconWrapperClassNames:
        "w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center",
      shieldIconClassNames: "w-4 h-4 text-orange-600",
      lockIconClassNames: "w-4 h-4 text-orange-600",
    },
    Apple: {
      networkIconClassNames: "w-5 h-5 text-blue-600",
      networkIconWrapperClassNames:
        "w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center",
      shieldIconClassNames: "w-4 h-4 text-green-600",
      lockIconClassNames: "w-4 h-4 text-red-600",
    },
  };
  const currentTheme = detailsTheme[theme];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-md bg-white/20"
          onClick={onClose}
        />

        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={currentTheme.networkIconWrapperClassNames}>
                  <Wifi className={currentTheme.networkIconClassNames} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    WiFi Network Details
                  </h2>
                  <p className="text-sm text-gray-500">Network information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : wifiNetwork ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Signal className="w-4 h-4 text-blue-600" />
                        Network Information
                      </h3>
                      {wifiNetwork.hidden && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          <EyeOff className="w-3 h-3" />
                          Hidden
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          SSID
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-gray-900 font-mono bg-white px-3 py-2 rounded-lg border">
                            {wifiNetwork.ssid}
                          </p>
                          <button
                            onClick={() =>
                              handleCopyToClipboard(wifiNetwork.ssid, "ssid")
                            }
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {copiedField === "ssid" ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Security Type
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <Shield
                            className={currentTheme.shieldIconClassNames}
                          />
                          <p className="text-gray-900">
                            {wifiNetwork.security_display}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Frequency
                        </label>
                        <p className="mt-1 text-gray-900">
                          {wifiNetwork.frequency_display}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <div className="mt-1">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              wifiNetwork.connection_status === "Connected"
                                ? "text-blue-800 bg-blue-100"
                                : wifiNetwork.connection_status === "Saved"
                                  ? "text-green-800 bg-green-100"
                                  : "text-gray-800 bg-gray-100",
                            )}
                          >
                            {wifiNetwork.connection_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Lock className={currentTheme.lockIconClassNames} />
                      Security Information
                    </h3>

                    <div className="space-y-4">
                      {wifiNetwork.security_type === "NONE" ? (
                        <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                          <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                            <Shield className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-orange-900">
                              No Security
                            </h4>
                            <p className="text-sm text-orange-700 mt-1">
                              This Wi-Fi network doesn't have any security
                              protection.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {wifiNetwork.password && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Password
                              </label>
                              <div className="mt-1 flex items-center gap-2">
                                <code className="text-gray-900 font-mono bg-white px-3 py-2 rounded-lg border flex-1">
                                  {wifiNetwork.password}
                                </code>
                                <button
                                  onClick={() =>
                                    handleCopyToClipboard(
                                      wifiNetwork.password,
                                      "password",
                                    )
                                  }
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  {copiedField === "password" ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {wifiNetwork.security_strength && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Security Strength
                              </label>
                              <div className="mt-1 flex items-center gap-3">
                                <span
                                  className={cn(
                                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                                    getSecurityStrengthColor(
                                      wifiNetwork.security_strength.color,
                                    ),
                                  )}
                                >
                                  {wifiNetwork.security_strength.level}
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={cn(
                                      "h-2 rounded-full transition-all duration-300",
                                      wifiNetwork.security_strength.color ===
                                        "green"
                                        ? "bg-green-500"
                                        : wifiNetwork.security_strength
                                              .color === "orange"
                                          ? "bg-orange-500"
                                          : "bg-red-500",
                                    )}
                                    style={{
                                      width: `${wifiNetwork.security_strength.score}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 font-medium">
                                  {wifiNetwork.security_strength.score}/100
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      Connection Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Last Connected
                        </label>
                        <p className="mt-1 text-gray-900">
                          {wifiNetwork.last_connected_display}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Added On
                        </label>
                        <p className="mt-1 text-gray-900">
                          {formatDate(wifiNetwork.created_at)}
                        </p>
                      </div>

                      {wifiNetwork.backup_model && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Device Model
                          </label>
                          <div className="mt-1 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900">
                              {wifiNetwork.backup_model}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Network ID
                        </label>
                        <p className="mt-1 text-gray-500 font-mono text-sm">
                          {wifiNetwork.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No network details available</p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default WiFiDetailsModal;
