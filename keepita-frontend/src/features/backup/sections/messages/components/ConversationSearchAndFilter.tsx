import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpDown, SortAsc, SortDesc } from "lucide-react";
import type { ChatMessageFilters } from "../types/message.types";
import {
  MESSAGE_CONVERSATION_SORT_OPTIONS_FOR_HEADER,
  CONVERSATION_QUICK_FILTERS,
} from "../constants/message.constants";
import { AdvancedConversationFilters } from "./AdvancedConversationFilters";

type Theme = "Samsung" | "Xiaomi" | "Apple" | undefined;

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
  theme?: Theme;
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
  theme = "Samsung",
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        onSearchChange(localSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, searchQuery, onSearchChange]);

  React.useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleFilterChange = (key: string, value: unknown) => {
    const partialUpdate = { [key]: value };
    onFiltersChange(partialUpdate);
  };

  const handleSortSelect = (
    option: (typeof MESSAGE_CONVERSATION_SORT_OPTIONS_FOR_HEADER)[number],
  ) => {
    onSortChange({
      field: option.field,
      direction: option.direction,
    });
    setShowSortDropdown(false);
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      key !== "ordering" &&
      key !== "page" &&
      key !== "page_size" &&
      filters[key as keyof ChatMessageFilters] !== undefined,
  );

  const themeConfig = {
    Samsung: {
      containerClass:
        "bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm mx-4 mt-4",
      inputClass:
        "w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200",
      inputTextColor: "text-black",
      searchIconClass: "text-gray-400 w-4 h-4",
      clearButtonClass: "p-1 rounded-full hover:bg-gray-200 transition-colors",
      clearIconClass: "w-4 h-4 text-gray-400",
      sortButtonClass:
        "flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium bg-white text-gray-700 hover:bg-gray-50",
      sortIconClass: "w-4 h-4",
      dropdownClass:
        "absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50",
      sortOptionClass: (isActive: boolean) =>
        `w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
          isActive ? "text-blue-600 bg-blue-50" : "text-gray-700"
        }`,
      sortOptionArrowClass: "text-xs",
      filterButtonClass: (isActive: boolean) =>
        `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border-none ${
          isActive
            ? "bg-gray-100 text-[#2F7CF5]"
            : "bg-white text-[#2F7CF5] hover:bg-gray-100"
        }`,
      filterIconClass: "w-3.5 h-3.5 text-[#2F7CF5]",
      clearFiltersContainerClass:
        "flex items-center justify-between pt-2 border-t border-gray-100",
      clearFiltersTextClass: "text-sm text-gray-600",
      clearFiltersButtonClass:
        "text-sm text-blue-600 hover:text-blue-700 font-medium",
      resultsCountContainerClass: "mt-3 pt-3 border-t border-gray-100",
      resultsCountTextClass: "text-sm text-gray-500",
    },
    Xiaomi: {
      containerClass:
        "bg-red-100 rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm mx-4 mt-4",
      inputClass:
        "w-full pl-10 pr-10 py-3 rounded-xl text-sm bg-gray-50 focus:outline-none transition-all duration-200",
      inputTextColor: "text-stone-700 font-semibold",
      searchIconClass: "text-gray-400 w-4 h-4",
      clearButtonClass: "p-1 rounded-full hover:bg-gray-200 transition-colors",
      clearIconClass: "size-6 text-stone-600",
      sortButtonClass:
        "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-200/30 text-stone-700 hover:bg-red-200/60",
      sortIconClass: "w-4 h-4",
      dropdownClass:
        "absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50",
      sortOptionClass: (isActive: boolean) =>
        `w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
          isActive ? "text-blue-600 bg-blue-50" : "text-gray-700"
        }`,
      sortOptionArrowClass: "text-xs",
      filterButtonClass: (isActive: boolean) =>
        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? "bg-red-300/50 text-stone-700"
            : "bg-red-200/50 text-stone-700 hover:bg-red-300/40"
        }`,
      filterIconClass: "w-3.5 h-3.5",
      clearFiltersContainerClass:
        "flex items-center justify-between pt-2 border-t border-gray-100",
      clearFiltersTextClass: "text-sm text-stone-700",
      clearFiltersButtonClass:
        "text-sm text-stone-800 hover:text-stone-900 font-medium",
      resultsCountContainerClass: "mt-3 pt-3 border-t border-gray-100",
      resultsCountTextClass: "text-sm text-stone-700",
    },
    Apple: {
      containerClass: "bg-[#F5F5F5] rounded-2xl p-6 mx-4 mt-4",
      inputClass:
        "w-full pl-10 pr-10 py-3 rounded-xl text-md bg-[#E9E9EA] focus:bg-white transition-all duration-200 focus:outline-none ",
      inputTextColor: "text-gray-700",
      searchIconClass: "text-gray-400 w-5 h-5",
      clearButtonClass: "p-1 rounded-full hover:bg-gray-200 transition-colors",
      clearIconClass: "w-5 h-5 text-gray-400",
      sortButtonClass:
        "flex items-center gap-2 px-4 py-3 rounded-2xl text-md font-medium bg-[#1E1E1E] hover:bg-[#2E2E2E] transition-all duration-200 hover:text-white hover:cursor-pointer ",
      sortIconClass: "w-5 h-5",
      dropdownClass:
        "absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50",
      sortOptionClass: (isActive: boolean) =>
        `w-full px-4 py-5  text-left text-md hover:bg-gray-50 flex items-center justify-between ${
          isActive ? "text-gray-900 bg-gray-200" : "text-gray-600"
        }`,
      sortOptionArrowClass: "text-xs",
      filterButtonClass: (isActive: boolean) =>
        `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
          isActive
            ? "bg-[#007AFF] text-white border-none"
            : "bg-white text-[#2F7CF5] border-none"
        }`,
      filterIconClass: "w-3.5 h-3.5",
      clearFiltersContainerClass:
        "flex items-center justify-between pt-2 border-t border-gray-200",
      clearFiltersTextClass: "text-sm text-gray-600",
      clearFiltersButtonClass:
        "text-sm text-blue-600 hover:text-blue-700 font-medium",
      resultsCountContainerClass: "mt-3 pt-3 border-t border-gray-200",
      resultsCountTextClass: "text-sm text-gray-500",
    },
  };

  const currentTheme = themeConfig[theme || "Samsung"];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={currentTheme.containerClass}
      >
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.searchIconClass}`}
            />
            <input
              type="text"
              placeholder="Search messages in this conversation..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className={`${currentTheme.inputClass} ${currentTheme.inputTextColor}`}
            />
            <AnimatePresence>
              {localSearchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  onClick={() => setLocalSearchQuery("")}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${currentTheme.clearButtonClass}`}
                >
                  <X className={currentTheme.clearIconClass} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={currentTheme.sortButtonClass}
            >
              <ArrowUpDown className={currentTheme.sortIconClass} />
              <span className="hidden sm:inline">Sort</span>
              {sortConfig.direction === "asc" ? (
                <SortAsc className={currentTheme.sortIconClass} />
              ) : (
                <SortDesc className={currentTheme.sortIconClass} />
              )}
            </motion.button>

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
                    className={currentTheme.dropdownClass}
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
                            className={currentTheme.sortOptionClass(isActive)}
                          >
                            <span>{option.label}</span>
                            {isActive && (
                              <span
                                className={currentTheme.sortOptionArrowClass}
                              >
                                {option.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </motion.button>
                        );
                      },
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-3">
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
                      isActive ? undefined : filter.value,
                    )
                  }
                  className={currentTheme.filterButtonClass(isActive)}
                >
                  <IconComponent className={currentTheme.filterIconClass} />
                  {filter.label}
                </button>
              );
            })}
          </div>

          <AdvancedConversationFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            isOpen={showAdvancedFilters}
            onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
            theme={theme || "Samsung"}
          />

          {hasActiveFilters && onClearAllFilters && (
            <div className={currentTheme.clearFiltersContainerClass}>
              <p className={currentTheme.clearFiltersTextClass}>
                Filters active
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClearAllFilters}
                className={currentTheme.clearFiltersButtonClass}
              >
                Clear all filters
              </motion.button>
            </div>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <div className={currentTheme.resultsCountContainerClass}>
            <p className={currentTheme.resultsCountTextClass}>
              {activeFiltersCount} filter {activeFiltersCount === 1 ? "" : "s"}
              active
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
