import React from "react";
import { motion } from "framer-motion";
import {
  Bluetooth,
  Smartphone,
  Headphones,
  Computer,
  Speaker,
  Watch,
  Gamepad2,
} from "lucide-react";
import {
  type BluetoothDevice,
  type BluetoothDeviceType,
} from "../types/bluetooth.types";
import {
  formatDeviceName,
  formatMacAddress,
  formatLastConnected,
  formatBondState,
  getDeviceType,
} from "../utils/bluetooth.utils";
import { BondState } from "../types/bluetooth.types";

interface BluetoothDeviceItemProps {
  device: BluetoothDevice;
}

const getDeviceIcon = (deviceType: BluetoothDeviceType, size: number = 20) => {
  const props = { size, className: "text-blue-600" };

  switch (deviceType) {
    case "audio":
      return <Headphones {...props} />;
    case "phone":
      return <Smartphone {...props} />;
    case "computer":
      return <Computer {...props} />;
    case "tv":
      return <Speaker {...props} />;
    case "input":
      return <Gamepad2 {...props} />;
    case "peripheral":
      return <Watch {...props} />;
    default:
      return <Bluetooth {...props} />;
  }
};

const getBondStateColor = (bondState: number) => {
  switch (bondState) {
    case BondState.BONDED:
      return "text-green-600 bg-green-50";
    case BondState.BONDING:
      return "text-yellow-600 bg-yellow-50";
    case BondState.NONE:
    default:
      return "text-gray-500 bg-gray-50";
  }
};

const BluetoothDeviceItem: React.FC<BluetoothDeviceItemProps> = ({
  device,
}) => {
  const deviceType = getDeviceType(device.device_class);
  const formattedName = formatDeviceName(device);
  const formattedAddress = formatMacAddress(device.address);
  const formattedDate = formatLastConnected(device.last_connected);
  const bondStateText = formatBondState(device.bond_state);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative bg-white rounded-2xl p-5 mb-3 border-2 border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
    >
      {/* Main Content - Balanced Layout */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        {/* Left Side - Device Info */}
        <div className="flex items-start space-x-4 flex-1 mb-3 sm:mb-0">
          {/* Device Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              {getDeviceIcon(deviceType, 24)}
            </div>
          </div>

          {/* Device Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {formattedName}
              </h3>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-mono">
                {formattedAddress}
              </p>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 capitalize">
                  {deviceType} device
                </span>
                {device.device_class && (
                  <span className="text-xs text-gray-400">
                    • Class: {device.device_class.toString(16).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Status & Connection Info */}
        <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start space-x-4 sm:space-x-0 sm:space-y-2 sm:ml-4">
          {/* Bond State Badge */}
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
              ${getBondStateColor(device.bond_state)}
            `}
          >
            {bondStateText}
          </span>

          {/* Last Connected */}
          {device.last_connected && (
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-500">Last connected</p>
              <p className="text-xs font-medium text-gray-700">
                {formattedDate}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BluetoothDeviceItem;
