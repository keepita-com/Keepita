import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Check,
  Clock,
  FileText,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import React, { forwardRef, useEffect, useRef, useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import SortMenu from "./SortMenu";
import { debounce } from "../../../shared/utils/debounce";

const CustomDateInput = forwardRef<
  HTMLInputElement,
  { value?: string; onClick?: () => void; placeholder?: string }
>(({ value, onClick, placeholder }, ref) => (
  <input
    ref={ref}
    onClick={onClick}
    value={value}
    placeholder={placeholder}
    readOnly
    className="date-picker-input"
  />
));

interface SearchAndFilterBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: BackupFilters) => void;
  onSortChange: (field: string, direction: "asc" | "desc") => void;
  activeSort: {
    field: string;
    direction: "asc" | "desc";
  };
  filters: BackupFilters;
  searchQuery: string;
}

export interface BackupFilters {
  status?: "completed" | "processing" | "failed" | null;
  customDateFrom?: string;
  customDateTo?: string;
}

const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  onSearch,
  onFilterChange,
  onSortChange,
  activeSort,
  filters,
  searchQuery: externalSearchQuery,
}) => {
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSortMenu &&
        !(event.target as Element).closest(".sort-menu-container")
      ) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortMenu]);

  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        onSearchRef.current(query);
      }, 500),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = () => {
    setShowFilterPanel(!showFilterPanel);
  };

  const handleFilterChange = (filterType: keyof BackupFilters, value: any) => {
    const newFilters = {
      ...filters,
      [filterType]: value === filters[filterType] ? null : value,
    };
    onFilterChange(newFilters);
  };

  const handleSort = (field: string) => {
    const newDirection =
      activeSort.field === field && activeSort.direction === "asc"
        ? "desc"
        : "asc";
    onSortChange(field, newDirection);
  };

  const clearFilters = () => {
    const newFilters = {
      status: null,
      customDateFrom: undefined,
      customDateTo: undefined,
    };
    setSearchQuery("");
    onSearch("");
    onFilterChange(newFilters);
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.customDateFrom || filters.customDateTo) count++;
    return count;
  };

  const filterCount = getFilterCount();
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.div
          className={`relative flex-grow order-1 sm:order-none z-20 `}
          initial={{ scale: 0.98 }}
          animate={{
            scale: 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative bg-gray-800/50 rounded-xl backdrop-blur-xs">
            <motion.div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 rounded-lg" />
            </motion.div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10 py-2.5  w-full rounded-xl border border-gray-700/30 focus:border-indigo-500/50 focus:outline-none focus:ring-0 transition-all duration-200 text-gray-200 placeholder-gray-500"
              placeholder="Search backups..."
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => {
                  setSearchQuery("");
                  onSearch("");
                }}
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
              </motion.button>
            )}
          </div>
        </motion.div>
        <div className="flex order-2 sm:order-none gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`relative flex-1 sm:flex-auto px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-0 focus-visible:outline-none ${
              showFilterPanel
                ? "bg-indigo-600 text-white border border-transparent"
                : "bg-gray-800/50 backdrop-blur-md text-gray-300 hover:text-white border border-gray-700/30"
            }`}
            onClick={handleFilterClick}
            style={{ outline: "none" }}
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter</span>
            {filterCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
              >
                {filterCount}
              </motion.div>
            )}
          </motion.button>

          <motion.div className="relative flex-1 sm:flex-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 bg-gray-800/50 dark:bg-gray-900/50 backdrop-blur-md text-gray-300 hover:text-white border border-gray-700/30 transition-all"
              onClick={() => setShowSortMenu((prev) => !prev)}
            >
              <div className="relative">
                <SlidersHorizontal className="w-5 h-5" />
                <motion.div
                  className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-indigo-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <span className="font-medium">Sort</span>
            </motion.button>

            <SortMenu
              isOpen={showSortMenu}
              activeField={activeSort.field}
              direction={activeSort.direction}
              onSort={(field) => handleSort(field)}
              onClose={() => setShowSortMenu(false)}
            />
          </motion.div>
        </div>
      </div>{" "}
      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 bg-gray-800/70 backdrop-blur-md border border-gray-700/30 rounded-xl p-4 overflow-hidden z-20"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="space-y-2">
                <h3 className="text-gray-300 font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-indigo-400" />
                  Status
                </h3>{" "}
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    label="Completed"
                    icon={<Check className="w-4 h-4" />}
                    active={filters.status === "completed"}
                    onClick={() => handleFilterChange("status", "completed")}
                    mobileView
                  />
                  <FilterButton
                    label="Processing"
                    icon={<Clock className="w-4 h-4" />}
                    active={filters.status === "processing"}
                    onClick={() => handleFilterChange("status", "processing")}
                    mobileView
                  />
                  <FilterButton
                    label="Failed"
                    icon={<X className="w-4 h-4" />}
                    active={filters.status === "failed"}
                    onClick={() => handleFilterChange("status", "failed")}
                    mobileView
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-300 font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                  Date Range
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">From</span>
                    <DatePicker
                      selected={
                        filters.customDateFrom
                          ? new Date(filters.customDateFrom)
                          : null
                      }
                      onChange={(date: Date | null) => {
                        const newFilters = {
                          ...filters,
                          customDateFrom: date
                            ? date.toISOString().split("T")[0]
                            : undefined,
                        };
                        onFilterChange(newFilters);
                      }}
                      selectsStart
                      startDate={
                        filters.customDateFrom
                          ? new Date(filters.customDateFrom)
                          : undefined
                      }
                      endDate={
                        filters.customDateTo
                          ? new Date(filters.customDateTo)
                          : undefined
                      }
                      maxDate={
                        filters.customDateTo
                          ? new Date(filters.customDateTo)
                          : undefined
                      }
                      placeholderText="Select date"
                      customInput={<CustomDateInput />}
                      dateFormat="yyyy-MM-dd"
                      popperPlacement="bottom-start"
                      portalId="root"
                      popperProps={{
                        strategy: "fixed",
                      }}
                      popperClassName="z-[99999]"
                    />
                  </div>
                  <span className="text-gray-500">–</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">To</span>
                    <DatePicker
                      selected={
                        filters.customDateTo
                          ? new Date(filters.customDateTo)
                          : null
                      }
                      onChange={(date: Date | null) => {
                        const newFilters = {
                          ...filters,
                          customDateTo: date
                            ? date.toISOString().split("T")[0]
                            : undefined,
                        };
                        onFilterChange(newFilters);
                      }}
                      selectsEnd
                      startDate={
                        filters.customDateFrom
                          ? new Date(filters.customDateFrom)
                          : undefined
                      }
                      endDate={
                        filters.customDateTo
                          ? new Date(filters.customDateTo)
                          : undefined
                      }
                      minDate={
                        filters.customDateFrom
                          ? new Date(filters.customDateFrom)
                          : undefined
                      }
                      placeholderText="Select date"
                      customInput={<CustomDateInput />}
                      dateFormat="yyyy-MM-dd"
                      popperPlacement="bottom-start"
                      portalId="root"
                      popperProps={{
                        strategy: "fixed",
                      }}
                      popperClassName="z-[99999]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-end ml-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3 py-2 text-sm bg-gray-700/50 text-gray-300 rounded-lg flex items-center space-x-1 hover:bg-gray-700 transition-colors"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4" />
                  <span>Clear Filters</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface FilterButtonProps {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
  mobileView?: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  icon,
  active,
  onClick,
  mobileView = false,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
        mobileView ? "flex-1 justify-center sm:flex-none sm:justify-start" : ""
      } ${
        active
          ? "bg-indigo-600/90 text-white font-medium"
          : "bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700"
      }`}
    >
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="w-4 h-4" />
          </motion.div>
        ) : icon ? (
          <motion.div
            key="icon"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            {icon}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <span>{label}</span>
    </motion.button>
  );
};

export default SearchAndFilterBar;
