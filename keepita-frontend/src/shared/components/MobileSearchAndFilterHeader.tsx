import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpDown, SortAsc, SortDesc } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "Samsung" | "Xiaomi" | "Apple";

interface FilterOption {
  key: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: string;
}

interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: "asc" | "desc";
}

interface ThemeClasses {
  containerClass: string;
  searchContainerClass: string;
  inputContainerClass: string;
  searchIconClass: string;
  inputClass: string;
  clearButtonClass: string;
  clearIconClass: string;
  sortButtonClass: string;
  sortIconClass: string;
  dropdownOverlayClass: string;
  dropdownClass: string;
  sortOptionClass: (isActive: boolean) => string;
  sortOptionArrowClass: string;
  filterContainerClass: string;
  filterButtonClass: (isActive: boolean) => string;
  filterIconClass: (isActive: boolean, color?: string) => string;
  clearFiltersContainerClass: string;
  clearFiltersTextClass: string;
  clearFiltersButtonClass: string;
  resultsCountContainerClass: string;
  resultsCountTextClass: string;
}

interface MobileSearchAndFilterHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;

  filters?: Record<string, boolean | undefined>;
  onFiltersChange?: (filters: Record<string, boolean | undefined>) => void;
  filterOptions?: FilterOption[];

  customFilterElements?: React.ReactNode;

  onClearFilters?: () => void;
  hasActiveFilters?: boolean;

  sortConfig: { field: string; direction: "asc" | "desc" };
  onSortChange: (config: { field: string; direction: "asc" | "desc" }) => void;
  sortOptions: SortOption[];

  resultsCount?: number;
  resultsLabel?: string;
  theme?: Theme;
  isClearFilterRender?: boolean;
  searchInputBackgroundColor?: string;

  classOverrides?: Partial<{
    containerClass?: string;
    searchContainerClass?: string;
    inputContainerClass?: string;
    searchIconClass?: string;
    inputClass?: string;
    clearButtonClass?: string;
    clearIconClass?: string;
    sortButtonClass?: string;
    sortIconClass?: string;
    dropdownOverlayClass?: string;
    dropdownClass?: string;
    sortOptionClass?: (isActive: boolean) => string;
    sortOptionArrowClass?: string;
    filterContainerClass?: string;
    filterButtonClass?: (isActive: boolean) => string;
    filterIconClass?: (isActive: boolean, color?: string) => string;
    clearFiltersContainerClass?: string;
    clearFiltersTextClass?: string;
    clearFiltersButtonClass?: string;
    resultsCountContainerClass?: string;
    resultsCountTextClass?: string;
  }>;
}

const MobileSearchAndFilterHeader: React.FC<
  MobileSearchAndFilterHeaderProps
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
  theme = "Samsung",
  isClearFilterRender = true,
  searchInputBackgroundColor = "bg-red-200/30",
  classOverrides,
}) => {
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

  const handleFilterToggle = React.useCallback(
    (filterKey: string) => {
      if (!filters || !onFiltersChange) return;

      const newFilters = {
        ...filters,
        [filterKey]: filters[filterKey] ? undefined : true,
      };
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange],
  );

  const handleSortSelect = React.useCallback(
    (option: SortOption) => {
      onSortChange({
        field: option.field,
        direction: option.direction,
      });
      setShowSortDropdown(false);
    },
    [onSortChange],
  );

  const defaultThemeConfig: Record<Theme, ThemeClasses> = {
    Samsung: {
      containerClass:
        "bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm mx-4 mt-4",
      searchContainerClass:
        "flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4",
      inputContainerClass: "relative flex-1",
      searchIconClass:
        "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4",
      inputClass:
        "w-full pl-10 pr-10 py-3 border text-black border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200",
      clearButtonClass:
        "absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors",
      clearIconClass: "w-4 h-4 text-gray-400",
      sortButtonClass:
        "flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium bg-white text-gray-700 hover:bg-gray-50",
      sortIconClass: "w-4 h-4",
      dropdownOverlayClass: "fixed inset-0 z-40",
      dropdownClass:
        "absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50",
      sortOptionClass: (isActive: boolean) =>
        `w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
          isActive ? "text-blue-600 bg-blue-50" : "text-gray-700"
        }`,
      sortOptionArrowClass: "text-xs",
      filterContainerClass: "space-y-3",
      filterButtonClass: (isActive: boolean) =>
        `flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all border-none ${
          isActive
            ? "bg-gray-100 text-[#2F7CF5]"
            : "bg-white text-[#2F7CF5] hover:bg-gray-100"
        }`,
      filterIconClass: () => `w-4 h-4 text-[#2F7CF5]`,
      clearFiltersContainerClass:
        "flex items-center justify-between pt-2 border-t border-gray-100",
      clearFiltersTextClass: "text-sm text-gray-600",
      clearFiltersButtonClass:
        "text-sm text-blue-600 hover:text-blue-700 font-medium",
      resultsCountContainerClass: "mt-3 pt-3 border-t border-gray-100",
      resultsCountTextClass: "text-sm text-gray-500",
    },
    Xiaomi: {
      containerClass: "bg-red-100 rounded-2xl w-full mx-auto pt-2 mb-2  ",
      searchContainerClass:
        "flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4 mx-4 mt-0.5",
      inputContainerClass: "relative flex-1",
      searchIconClass:
        "absolute left-4 top-[48%] transform -translate-y-1/2 text-stone-600/80 w-5 h-6",
      inputClass: `w-full pl-13 pr-10 py-3 border text-stone-900 font-semibold border-red-200/60 rounded-xl text-sm sm:text-md ${searchInputBackgroundColor} focus:border-red-200 focus:outline-none transition-all duration-200`,
      clearButtonClass:
        "absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full cursor-pointer",
      clearIconClass: "size-6 text-stone-600",
      sortButtonClass:
        "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-200/30 text-stone-700 hover:bg-red-200/60",
      sortIconClass: "w-4 h-4 text-stone-700",
      dropdownOverlayClass: "fixed inset-0 z-40",
      dropdownClass:
        "absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50",
      sortOptionClass: (isActive: boolean) =>
        `w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
          isActive ? "text-blue-600 bg-blue-50" : "text-gray-700"
        }`,
      sortOptionArrowClass: "text-xs",
      filterContainerClass: "space-y-3",
      filterButtonClass: (isActive: boolean) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? "bg-red-200 text-stone-800"
            : "bg-red-200/30 text-stone-700 hover:bg-red-200"
        }`,
      filterIconClass: () => "w-4 h-4 text-stone-700",
      clearFiltersContainerClass:
        "flex items-center justify-between pt-2 px-4 border-t border-gray-100",
      clearFiltersTextClass: "text-sm text-stone-700",
      clearFiltersButtonClass:
        "text-sm text-stone-900 hover:text-stone-950 font-medium",
      resultsCountContainerClass: "mt-3 pt-3 px-4 border-t border-gray-100",
      resultsCountTextClass: "text-sm text-stone-700",
    },
    Apple: {
      containerClass: "bg-[#F5F5F5]  p-4 m-2 rounded-2xl",
      searchContainerClass:
        "flex flex-col  sm:flex-row gap-3 items-stretch sm:items-center mb-4",
      inputContainerClass: "relative flex-1",
      searchIconClass:
        "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4",
      inputClass:
        " w-full pl-10 pr-10 py-3 text-black focus:bg-white rounded-xl text-sm bg-[#E9E9EA] focus:outline-none transition-all duration-200",
      clearButtonClass:
        "absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors",
      clearIconClass: "w-4 h-4 text-gray-400",
      sortButtonClass:
        "flex items-center gap-2 px-4 py-3  rounded-xl text-sm font-medium bg-[#1E1E1E] hover:bg-[#2e2e2e] hover:cursor-pointer transition-all duration-200",
      sortIconClass: "w-4 h-4 ",
      dropdownOverlayClass: "fixed inset-0 z-40 ",
      dropdownClass:
        "absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50",
      sortOptionClass: (isActive: boolean) =>
        `w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
          isActive ? "text-blue-600 bg-blue-50" : "text-gray-700"
        }`,
      sortOptionArrowClass: "text-xs",
      filterContainerClass: "space-y-3",
      filterButtonClass: (isActive: boolean) =>
        `flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
          isActive ? "bg-[#007AFF] text-white" : "bg-white text-[#2F7CF5]"
        }`,
      filterIconClass: (isActive: boolean, color?: string) =>
        `w-4 h-4 ${isActive ? "text-white" : color || "text-gray-600"}`,
      clearFiltersContainerClass:
        "flex items-center justify-between pt-2 border-t border-gray-200",
      clearFiltersTextClass: "text-sm text-gray-600",
      clearFiltersButtonClass:
        "text-sm text-blue-600 hover:text-blue-700 font-medium",
      resultsCountContainerClass: "mt-3 pt-3 border-t border-gray-200",
      resultsCountTextClass: "text-sm text-gray-500",
    },
  };

  const currentTheme = useMemo(() => {
    const base = defaultThemeConfig[theme];
    return {
      ...base,
      containerClass: cn(base.containerClass, classOverrides?.containerClass),
      searchContainerClass: cn(
        base.searchContainerClass,
        classOverrides?.searchContainerClass,
      ),
      inputContainerClass: cn(
        base.inputContainerClass,
        classOverrides?.inputContainerClass,
      ),
      searchIconClass: cn(
        base.searchIconClass,
        classOverrides?.searchIconClass,
      ),
      inputClass: cn(base.inputClass, classOverrides?.inputClass),
      clearButtonClass: cn(
        base.clearButtonClass,
        classOverrides?.clearButtonClass,
      ),
      clearIconClass: cn(base.clearIconClass, classOverrides?.clearIconClass),
      sortButtonClass: cn(
        base.sortButtonClass,
        classOverrides?.sortButtonClass,
      ),
      sortIconClass: cn(base.sortIconClass, classOverrides?.sortIconClass),
      dropdownOverlayClass: cn(
        base.dropdownOverlayClass,
        classOverrides?.dropdownOverlayClass,
      ),
      dropdownClass: cn(base.dropdownClass, classOverrides?.dropdownClass),
      sortOptionClass: (isActive: boolean) =>
        cn(
          base.sortOptionClass(isActive),
          classOverrides?.sortOptionClass?.(isActive),
        ),
      sortOptionArrowClass: cn(
        base.sortOptionArrowClass,
        classOverrides?.sortOptionArrowClass,
      ),
      filterContainerClass: cn(
        base.filterContainerClass,
        classOverrides?.filterContainerClass,
      ),
      filterButtonClass: (isActive: boolean) =>
        cn(
          base.filterButtonClass(isActive),
          classOverrides?.filterButtonClass?.(isActive),
        ),
      filterIconClass: (isActive: boolean, color?: string) =>
        cn(
          base.filterIconClass(isActive, color),
          classOverrides?.filterIconClass?.(isActive, color),
        ),
      clearFiltersContainerClass: cn(
        base.clearFiltersContainerClass,
        classOverrides?.clearFiltersContainerClass,
      ),
      clearFiltersTextClass: cn(
        base.clearFiltersTextClass,
        classOverrides?.clearFiltersTextClass,
      ),
      clearFiltersButtonClass: cn(
        base.clearFiltersButtonClass,
        classOverrides?.clearFiltersButtonClass,
      ),
      resultsCountContainerClass: cn(
        base.resultsCountContainerClass,
        classOverrides?.resultsCountContainerClass,
      ),
      resultsCountTextClass: cn(
        base.resultsCountTextClass,
        classOverrides?.resultsCountTextClass,
      ),
    };
  }, [theme, classOverrides]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={currentTheme.containerClass}
      >
        <div className={currentTheme.searchContainerClass}>
          <div className={currentTheme.inputContainerClass}>
            <Search className={currentTheme.searchIconClass} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className={currentTheme.inputClass}
            />
            <AnimatePresence>
              {localSearchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  onClick={() => setLocalSearchQuery("")}
                  className={currentTheme.clearButtonClass}
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
                    className={currentTheme.dropdownOverlayClass}
                    onClick={() => setShowSortDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={currentTheme.dropdownClass}
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
                          className={currentTheme.sortOptionClass(isActive)}
                        >
                          <span>{option.label}</span>
                          {isActive && (
                            <span className={currentTheme.sortOptionArrowClass}>
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

        {customFilterElements ? (
          <div className={currentTheme.filterContainerClass}>
            {customFilterElements}

            {hasActiveFilters && onClearFilters && isClearFilterRender && (
              <div className={currentTheme.clearFiltersContainerClass}>
                <p className={currentTheme.clearFiltersTextClass}>
                  Filters active
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClearFilters}
                  className={currentTheme.clearFiltersButtonClass}
                >
                  Clear all filters
                </motion.button>
              </div>
            )}
          </div>
        ) : (
          filterOptions &&
          filters && (
            <div className="flex flex-wrap gap-2 px-4 mb-2">
              {filterOptions.map((option) => {
                const isActive = filters[option.key];
                const IconComponent = option.icon;

                return (
                  <motion.button
                    key={option.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFilterToggle(option.key)}
                    className={currentTheme.filterButtonClass(
                      isActive ?? false,
                    )}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={currentTheme.filterIconClass(
                          isActive ?? false,
                          option.color,
                        )}
                      />
                    )}
                    <span>{option.label}</span>
                  </motion.button>
                );
              })}
            </div>
          )
        )}

        {resultsCount !== undefined && theme !== "Apple" && (
          <div className={currentTheme.resultsCountContainerClass}>
            <p className={currentTheme.resultsCountTextClass}>
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

export default MobileSearchAndFilterHeader;
