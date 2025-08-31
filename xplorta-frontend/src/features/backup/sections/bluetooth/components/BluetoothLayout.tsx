import React, { type ReactNode, useCallback, memo } from "react";
import { motion } from "framer-motion";
import SamsungSectionLayout from "../../../../../shared/components/SamsungSectionLayout";
import SamsungSearchAndFilterHeader from "../../../../../shared/components/SamsungSearchAndFilterHeader";
import {
  type BluetoothFilters,
  type BluetoothDeviceType,
} from "../types/bluetooth.types";
import {
  BLUETOOTH_SORT_OPTIONS,
  BLUETOOTH_DEVICE_TYPE_FILTERS,
  BLUETOOTH_BOND_STATE_FILTERS,
} from "../constants/bluetooth.constants";

interface BluetoothLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack: () => void;
  // Filter and sort props
  filters: BluetoothFilters;
  onFilterChange: (filters: BluetoothFilters) => void;
  onClearFilters: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  totalDevices?: number;
}

const BluetoothLayout: React.FC<BluetoothLayoutProps> = memo(
  ({
    children,
    title = "Bluetooth",
    subtitle,
    searchQuery,
    onSearchChange,
    onBack,
    filters,
    onFilterChange,
    onClearFilters,
    sortBy,
    sortOrder,
    onSortChange,
    totalDevices = 0,
  }) => {
    // Helper function to handle device type filtering
    const handleDeviceTypeFilter = useCallback(
      (type: BluetoothDeviceType) => {
        const isCurrentlySelected = filters.device_type === type;
        const newFilters = {
          ...filters,
          device_type: isCurrentlySelected ? undefined : type,
        };
        onFilterChange(newFilters);
      },
      [filters, onFilterChange]
    );

    // Helper function to check if a device type is selected
    const isDeviceTypeSelected = useCallback(
      (type: BluetoothDeviceType): boolean => {
        return filters.device_type === type;
      },
      [filters.device_type]
    );

    const handleBondStateFilter = useCallback(
      (bondState: number) => {
        const newFilters = {
          ...filters,
          bond_state: filters.bond_state === bondState ? undefined : bondState,
        };
        onFilterChange(newFilters);
      },
      [filters, onFilterChange]
    );

    const hasActiveFilters = Boolean(
      filters.device_class ||
        filters.device_type ||
        filters.bond_state !== undefined ||
        filters.date_from ||
        filters.date_to ||
        filters.name ||
        filters.address ||
        filters.appearance ||
        filters.link_type
    );

    // Convert sort options for the header component
    const sortOptions = BLUETOOTH_SORT_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      field: option.field,
      direction: option.direction,
    }));

    // Current sort configuration
    const sortConfig = {
      field: sortBy,
      direction: sortOrder as "asc" | "desc",
    };

    const handleSortChange = useCallback(
      (config: { field: string; direction: "asc" | "desc" }) => {
        onSortChange(config.field, config.direction);
      },
      [onSortChange]
    );

    // Custom filter elements
    const customFilterElements = (
      <>
        {/* Device Type Categories */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Device Types</h4>
          <div className="flex flex-wrap gap-2">
            {BLUETOOTH_DEVICE_TYPE_FILTERS.map((category, index) => {
              const isSelected = isDeviceTypeSelected(category.key);
              return (
                <motion.button
                  key={category.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeviceTypeFilter(category.key)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-base">{category.icon}</span>
                  <span className="hidden xs:inline sm:inline">
                    {category.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Connection Status Filters */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Connection Status
          </h4>
          <div className="flex flex-wrap gap-2">
            {BLUETOOTH_BOND_STATE_FILTERS.map((bondStatus) => {
              const isSelected = filters.bond_state === bondStatus.value;
              return (
                <motion.button
                  key={bondStatus.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBondStateFilter(bondStatus.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${bondStatus.color}`} />
                  {bondStatus.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </>
    );

    return (
      <SamsungSectionLayout title={title} subtitle={subtitle} onBack={onBack}>
        <SamsungSearchAndFilterHeader
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search devices..."
          customFilterElements={customFilterElements}
          onClearFilters={onClearFilters}
          hasActiveFilters={hasActiveFilters}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
          resultsCount={totalDevices}
          resultsLabel="devices"
        />
        {children}
      </SamsungSectionLayout>
    );
  }
);

export default BluetoothLayout;
