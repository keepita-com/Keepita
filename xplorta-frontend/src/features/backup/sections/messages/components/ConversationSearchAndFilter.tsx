/**
 * SamsungConversationSearchAndFilter.tsx
 * Samsung One UI style search and filter component for conversation messages
 * Matches the main messages page style
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpDown, SortAsc, SortDesc } from "lucide-react";
import type { ChatMessageFilters } from "../types/message.types";
import {
  MESSAGE_CONVERSATION_SORT_OPTIONS_FOR_HEADER,
  CONVERSATION_QUICK_FILTERS,
} from "../constants/message.constants";
import { AdvancedConversationFilters } from "./AdvancedConversationFilters";

interface MessageSortConfig {
  field: string;
  direction: "asc" | "desc";
}

interface ConversationSearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: ChatMessageFilters;
  onFiltersChange: (filters: ChatMessageFilters) => void;
  sortConfig: MessageSortConfig;
  onSortChange: (sortConfig: MessageSortConfig) => void;
  activeFiltersCount: number;
  onClearAllFilters?: () => void;
}

export const ConversationSearchAndFilter: React.FC<
  ConversationSearchAndFilterProps
> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  sortConfig,
  onSortChange,
  activeFiltersCount,
  onClearAllFilters,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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

  const handleFilterChange = (key: string, value: any) => {
    // Send partial update with the specific key
    const partialUpdate = { [key]: value };
    onFiltersChange(partialUpdate);
  };

  const handleSortSelect = (
    option: (typeof MESSAGE_CONVERSATION_SORT_OPTIONS_FOR_HEADER)[number]
  ) => {
    onSortChange({
      field: option.field,
      direction: option.direction,
    });
    setShowSortDropdown(false);
  };

  // Check if there are active filters
  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      key !== "ordering" &&
      key !== "page" &&
      key !== "page_size" &&
      filters[key as keyof ChatMessageFilters] !== undefined
  );

  return (
    <div>
      {/* Search and Filter Bar - Samsung One UI Style */}
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
              placeholder="Search messages in this conversation..."
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
                    {MESSAGE_CONVERSATION_SORT_OPTIONS_FOR_HEADER.map(
                      (option) => {
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
                      }
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Filter Categories - Individual filter buttons like main page */}
        <div className="space-y-3">
          {/* Quick Boolean Filters */}
          <div className="flex flex-wrap gap-2">
            {CONVERSATION_QUICK_FILTERS.map((filter) => {
              const IconComponent = filter.icon;
              const isActive =
                filters[filter.key as keyof ChatMessageFilters] ===
                filter.activeValue;

              return (
                <button
                  key={`${filter.key}-${filter.label}`}
                  onClick={() =>
                    handleFilterChange(
                      filter.key,
                      isActive ? undefined : filter.value
                    )
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    isActive ? filter.colors.active : filter.colors.inactive
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Advanced Filters Component */}
          <AdvancedConversationFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            isOpen={showAdvancedFilters}
            onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
          />

          {/* Clear filters and active status */}
          {hasActiveFilters && onClearAllFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600">Filters active</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </motion.button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {activeFiltersCount} filter{activeFiltersCount === 1 ? "" : "s"}{" "}
              active
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
