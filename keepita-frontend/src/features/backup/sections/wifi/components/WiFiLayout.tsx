import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, EyeOff, Clock, Download } from "lucide-react";
import type { WiFiFilters, WiFiSortConfig } from "../types/wifi.types";
import {
  WIFI_SORT_OPTIONS,
  WIFI_SECURITY_TYPE_FILTERS,
} from "../constants/wifi.constants";
import { cn } from "../../../../../shared/utils/cn";
import {
  SamsungSectionLayout,
  SamsungSearchAndFilterHeader,
} from "../../../../../shared/components";

interface WiFiLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onBack?: () => void;
  filters?: WiFiFilters;
  onFilterChange?: (filters: WiFiFilters) => void;
  onClearFilters?: () => void;
  sortConfig?: WiFiSortConfig;
  onSortChange?: (config: WiFiSortConfig) => void;
  totalWiFiNetworks?: number;
  onExport?: () => void;
}

const SORT_OPTIONS = WIFI_SORT_OPTIONS.map((option) => ({
  value: `${option.key}-${option.direction}`,
  label: option.label,
  field: option.key,
  direction: option.direction,
}));

/**
 * Samsung One UI style layout for WiFi networks using shared components
 */
const WiFiLayout: React.FC<WiFiLayoutProps> = ({
  children,
  title = "WiFi Networks",
  subtitle,
  searchQuery = "",
  onSearchChange,
  onBack,
  filters = {},
  onFilterChange,
  onClearFilters,
  sortConfig = { field: "created_at", direction: "desc" },
  onSortChange,
  totalWiFiNetworks = 0,
  onExport,
}) => {
  const [showDateFilters, setShowDateFilters] = useState(false);

  const handleFilterChange = (key: keyof WiFiFilters, value: any) => {
    onFilterChange?.({
      ...filters,
      [key]: value,
    });
  };

  const handleSortChange = (config: {
    field: string;
    direction: "asc" | "desc";
  }) => {
    onSortChange?.({
      field: config.field as any,
      direction: config.direction,
    });
  };

  const hasActiveFilters = () => {
    return Object.keys(filters).some((key) => {
      const value = filters[key as keyof WiFiFilters];
      return value !== undefined && value !== null && value !== "";
    });
  };

  const handleClearFilters = () => {
    onClearFilters?.();
  };

  // Custom filter elements for WiFi-specific filters
  const customFilterElements = (
    <div className="space-y-4">
      {/* Security Type Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Security Type
        </h4>
        <div className="flex flex-wrap gap-2">
          {WIFI_SECURITY_TYPE_FILTERS.map((security) => {
            const isSelected = filters.security_type === security.key;
            return (
              <motion.button
                key={security.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  handleFilterChange(
                    "security_type",
                    isSelected ? undefined : security.key
                  )
                }
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                  isSelected
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <span className="text-base">{security.icon}</span>
                <span className="hidden xs:inline sm:inline">
                  {security.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Network Status Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Network Status
        </h4>
        <div className="flex flex-wrap gap-2">
          {/* Saved Networks */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleFilterChange(
                "is_saved",
                filters.is_saved === true ? undefined : true
              )
            }
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
              filters.is_saved === true
                ? "bg-green-500 text-white shadow-sm"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            )}
          >
            <Shield className="w-4 h-4" />
            <span>Saved</span>
          </motion.button>

          {/* Hidden Networks */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleFilterChange(
                "hidden",
                filters.hidden === true ? undefined : true
              )
            }
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
              filters.hidden === true
                ? "bg-purple-500 text-white shadow-sm"
                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            )}
          >
            <EyeOff className="w-4 h-4" />
            <span>Hidden</span>
          </motion.button>
        </div>
      </div>

      {/* Date Range Filters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Date Filters</h4>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDateFilters(!showDateFilters)}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
              showDateFilters ||
                filters.created_from ||
                filters.created_to ||
                filters.last_connected_from ||
                filters.last_connected_to
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            <Clock className="w-3 h-3" />
            {showDateFilters ? "Hide" : "Show"}
          </motion.button>
        </div>

        <AnimatePresence>
          {showDateFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* Created Date Range */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Date Added
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.created_from || ""}
                    onChange={(e) =>
                      handleFilterChange("created_from", e.target.value)
                    }
                    className="w-full px-3 py-2 border text-black border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={filters.created_to || ""}
                    onChange={(e) =>
                      handleFilterChange("created_to", e.target.value)
                    }
                    className="w-full px-3 py-2 border text-black border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Last Connected Date Range */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Last Connected
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.last_connected_from || ""}
                    onChange={(e) =>
                      handleFilterChange("last_connected_from", e.target.value)
                    }
                    className="w-full px-3 py-2 border text-black border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={filters.last_connected_to || ""}
                    onChange={(e) =>
                      handleFilterChange("last_connected_to", e.target.value)
                    }
                    className="w-full px-3 py-2 border text-black border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Clear Date Filters */}
              {(filters.created_from ||
                filters.created_to ||
                filters.last_connected_from ||
                filters.last_connected_to) && (
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleFilterChange("created_from", "");
                      handleFilterChange("created_to", "");
                      handleFilterChange("last_connected_from", "");
                      handleFilterChange("last_connected_to", "");
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
                  >
                    Clear date filters
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <SamsungSectionLayout
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      showBackButton={!!onBack}
    >
      {/* Export Button Header */}
      {onExport && (
        <div className="flex justify-end px-4 py-2 border-b border-gray-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      )}

      <SamsungSearchAndFilterHeader
        searchQuery={searchQuery}
        onSearchChange={onSearchChange || (() => {})}
        searchPlaceholder="Search WiFi networks..."
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        sortOptions={SORT_OPTIONS}
        customFilterElements={customFilterElements}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters()}
        resultsCount={totalWiFiNetworks}
        resultsLabel="networks"
      />

      {/* Content */}
      <div className="px-4 py-4">{children}</div>
    </SamsungSectionLayout>
  );
};

export default WiFiLayout;
