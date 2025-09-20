/**
 * SamsungSearchAndFilterHeader.tsx
 * Samsung One UI style search and filter header component
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpDown, SortAsc, SortDesc } from "lucide-react";

interface FilterOption {
  key: string;
  label: string;
  icon?: React.ComponentType<any>;
  color?: string;
}

interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: "asc" | "desc";
}

interface SamsungSearchAndFilterHeaderProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;

  // Filters - New flexible approach
  filters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>) => void;
  filterOptions?: FilterOption[];

  // Custom filter elements for full reusability
  customFilterElements?: React.ReactNode;

  // Clear filters function for custom filters
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;

  // Sort
  sortConfig: { field: string; direction: "asc" | "desc" };
  onSortChange: (config: { field: string; direction: "asc" | "desc" }) => void;
  sortOptions: SortOption[];

  // Results count
  resultsCount?: number;
  resultsLabel?: string; // e.g., "devices", "contacts", "files"
}

const SamsungSearchAndFilterHeader: React.FC<
  SamsungSearchAndFilterHeaderProps
> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search devices...",
  filters,
  onFiltersChange,
  filterOptions,
  customFilterElements,
  onClearFilters,
  hasActiveFilters,
  sortConfig,
  onSortChange,
  sortOptions,
  resultsCount,
  resultsLabel = "items",
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce search input
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        onSearchChange(localSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, searchQuery, onSearchChange]);

  // Update local search when external search changes
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleFilterToggle = React.useCallback(
    (filterKey: string) => {
      if (!filters || !onFiltersChange) return;

      const newFilters = {
        ...filters,
        [filterKey]: filters[filterKey] ? undefined : true,
      };
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleSortSelect = React.useCallback(
    (option: SortOption) => {
      onSortChange({
        field: option.field,
        direction: option.direction,
      });
      setShowSortDropdown(false);
    },
    [onSortChange]
  );

  return (
    <div>
      {/* Search and Filter Bar - Exactly like My Files */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm mx-4 mt-4"
      >
        {/* Main Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border text-black border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200"
            />
            <AnimatePresence>
              {localSearchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  onClick={() => setLocalSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">Sort</span>
              {sortConfig.direction === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </motion.button>

            {/* Sort Dropdown Menu */}
            <AnimatePresence>
              {showSortDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSortDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                  >
                    {sortOptions.map((option) => {
                      const isActive =
                        option.field === sortConfig.field &&
                        option.direction === sortConfig.direction;

                      return (
                        <motion.button
                          key={option.value}
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          onClick={() => handleSortSelect(option)}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                            isActive
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          <span>{option.label}</span>
                          {isActive && (
                            <span className="text-xs">
                              {option.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Filter Categories */}
        {customFilterElements ? (
          <div className="space-y-3">
            {customFilterElements}

            {/* Clear filters and active status for custom filters */}
            {hasActiveFilters && onClearFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600">Filters active</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </motion.button>
              </div>
            )}
          </div>
        ) : (
          filterOptions &&
          filters && (
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const isActive = filters[option.key];
                const IconComponent = option.icon;

                return (
                  <motion.button
                    key={option.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFilterToggle(option.key)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={`w-4 h-4 ${
                          isActive
                            ? "text-white"
                            : option.color || "text-gray-600"
                        }`}
                      />
                    )}
                    <span>{option.label}</span>
                  </motion.button>
                );
              })}
            </div>
          )
        )}

        {/* Results Count */}
        {resultsCount !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {resultsCount}{" "}
              {resultsCount === 1
                ? resultsLabel.slice(0, -1) || "item"
                : resultsLabel}{" "}
              found
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SamsungSearchAndFilterHeader;
