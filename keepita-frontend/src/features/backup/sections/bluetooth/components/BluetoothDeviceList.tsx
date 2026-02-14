import React, { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Bluetooth,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { type BluetoothDevice } from "../types/bluetooth.types";
import { BluetoothDeviceListSkeleton } from "../components";
import BluetoothDeviceItem from "./BluetoothDeviceItem";
import { groupByType as groupDevicesByType } from "../utils/bluetooth.utils";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";

interface BluetoothDeviceListProps {
  devices: BluetoothDevice[];
  isLoading?: boolean;
  isInitialLoading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  groupByType?: boolean;

  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

interface DeviceGroupProps {
  title: string;
  devices: BluetoothDevice[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const DeviceGroup: React.FC<DeviceGroupProps> = ({
  title,
  devices,
  isExpanded,
  onToggleExpanded,
}) => {
  return (
    <div className="mb-6">
      <motion.button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-3 hover:bg-gray-100 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {title}
          </h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {devices.length}
          </span>
        </div>

        {isExpanded ? (
          <ChevronUp className="text-gray-500" size={20} />
        ) : (
          <ChevronDown className="text-gray-500" size={20} />
        )}
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white overflow-hidden"
          >
            {devices.map((device, index) => (
              <BluetoothDeviceItem
                key={device.id}
                device={device}
                isLast={index === devices.length - 1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BluetoothDeviceList: React.FC<BluetoothDeviceListProps> = ({
  devices,
  isLoading = false,
  isInitialLoading = false,
  isRefreshing = false,
  error = null,
  groupByType = true,
  hasNextPage = false,
  fetchNextPage,
  isFetchingNextPage = false,
}) => {
  const { theme } = useBackupTheme();
  const [expandedGroups, setExpandedGroups] = React.useState<
    Record<string, boolean>
  >({
    audio: true,
    phone: true,
    computer: true,
    tv: true,
    input: true,
    peripheral: true,
    unknown: true,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastDeviceRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage || isRefreshing) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && fetchNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isRefreshing],
  );

  const handleToggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  if (isInitialLoading || isRefreshing) {
    return <BluetoothDeviceListSkeleton count={6} />;
  }

  if (isLoading && devices.length === 0) {
    return <BluetoothDeviceListSkeleton count={6} />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-2xl p-6"
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-red-900">
              Failed to load devices
            </h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (devices.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Bluetooth className="text-gray-400" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Bluetooth devices found
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          It looks like no Bluetooth devices were found in this backup. Devices
          may not have been backed up or Bluetooth was disabled.
        </p>
      </motion.div>
    );
  }

  if (groupByType) {
    const groupedDevices = groupDevicesByType(devices);

    return (
      <div className="space-y-2">
        {Object.entries(groupedDevices).map(([type, typeDevices]) => {
          if (typeDevices.length === 0) return null;

          return (
            <DeviceGroup
              key={type}
              title={`${type} devices`}
              devices={typeDevices}
              isExpanded={expandedGroups[type] || false}
              onToggleExpanded={() => handleToggleGroup(type)}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={
        theme === "Apple" ? "bg-white rounded-3xl overflow-hidden" : "space-y-2"
      }
    >
      <AnimatePresence>
        {devices.map((device, index) => {
          const isLast = index === devices.length - 1;
          return (
            <BluetoothDeviceItem
              key={device.id}
              device={device}
              isLast={isLast}
              ref={isLast ? lastDeviceRef : undefined}
              initial={
                theme === "Apple" ? { opacity: 0 } : { opacity: 0, y: 20 }
              }
              animate={
                theme === "Apple" ? { opacity: 1 } : { opacity: 1, y: 0 }
              }
              transition={
                theme === "Apple" ? { duration: 0.2 } : { delay: index * 0.05 }
              }
            />
          );
        })}
      </AnimatePresence>

      {isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <div className="flex items-center space-x-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading more devices...</span>
          </div>
        </motion.div>
      )}

      {!hasNextPage && devices.length > 0 && theme !== "Apple" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <p className="text-sm text-gray-500">
            You've reached the end of the list
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BluetoothDeviceList;
