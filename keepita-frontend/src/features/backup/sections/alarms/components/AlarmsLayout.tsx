import React, { type ReactNode, useCallback, memo } from "react";
import { motion } from "framer-motion";
import SamsungSectionLayout from "../../../../../shared/components/SamsungSectionLayout";
import type { GetAlarmsParams } from "../types/alarm.types";
import {
  ALARM_SORT_OPTIONS,
  ALARM_STATUS_FILTERS,
  ALARM_REPEAT_FILTERS,
} from "../constants/alarms.constants";
import MobileSearchAndFilterHeader from "@/shared/components/MobileSearchAndFilterHeader";
import XiaomiSectionLayout from "@/shared/components/XiaomiSectionLayout";
import AppleSectionLayout from "@/shared/components/AppleSectionLayout";

interface AlarmsLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack: () => void;

  filters: Partial<GetAlarmsParams>;
  onFilterChange: (filters: Partial<GetAlarmsParams>) => void;
  onClearFilters: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  totalAlarms?: number;
  theme?: "Xiaomi" | "Samsung" | "Apple";
}

const AlarmsLayout: React.FC<AlarmsLayoutProps> = memo(
  ({
    children,
    title = "Alarms",
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
    totalAlarms = 0,
    theme = "Samsung",
  }) => {
    const handleStatusFilter = useCallback(
      (isActive: boolean) => {
        const isCurrentlySelected = filters.active === isActive;
        const newFilters = {
          ...filters,
          active: isCurrentlySelected ? undefined : isActive,
        };
        onFilterChange(newFilters);
      },
      [filters, onFilterChange],
    );

    const handleRepeatTypeFilter = useCallback(
      (repeatType: number) => {
        const newFilters = {
          ...filters,
          repeat_type:
            filters.repeat_type === repeatType ? undefined : repeatType,
        };
        onFilterChange(newFilters);
      },
      [filters, onFilterChange],
    );

    const hasActiveFilters = Boolean(
      filters.active !== undefined ||
      filters.repeat_type !== undefined ||
      filters.search ||
      filters.time_from ||
      filters.time_to,
    );

    const sortOptions = ALARM_SORT_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      field: option.value.replace(/^-/, ""),
      direction: (option.value.startsWith("-") ? "desc" : "asc") as
        | "asc"
        | "desc",
    }));

    const sortConfig = {
      field: sortBy,
      direction: sortOrder as "asc" | "desc",
    };

    const handleSortChange = useCallback(
      (config: { field: string; direction: "asc" | "desc" }) => {
        onSortChange(config.field, config.direction);
      },
      [onSortChange],
    );

    const renderSectionTheme = {
      Samsung: {
        layout: SamsungSectionLayout,
        theme: "Samsung",
        searchPlaceholder: "Search alarms...",
        filterOptionColorsClassNames:
          "bg-gray-100 text-gray-700 hover:bg-gray-200",
      },
      Xiaomi: {
        layout: XiaomiSectionLayout,
        theme: "Xiaomi",
        searchPlaceholder: "Search alarms",
        filterOptionColorsClassNames:
          "bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300",
      },
      Apple: {
        layout: AppleSectionLayout,
        theme: "Apple",
        searchPlaceholder: "Search alarms... ",
        filterOptionColorsClassNames: "bg-white text-[#2F7CF5] ",
      },
    };

    const currentTheme = renderSectionTheme[theme];

    const customFilterElements = (
      <>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Status</h4>
          <div className="flex flex-wrap gap-2">
            {ALARM_STATUS_FILTERS.map((status, index) => {
              const isSelected = filters.active === status.value;
              return (
                <motion.button
                  key={status.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStatusFilter(status.value)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${
                    theme === "Samsung" && "rounded-full"
                  } ${theme === "Xiaomi" && "rounded-lg"} ${
                    theme === "Apple" && "rounded-full"
                  } text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? status.value
                        ? "bg-green-500 text-white shadow-sm"
                        : "bg-red-500 text-white shadow-sm"
                      : currentTheme.filterOptionColorsClassNames
                  }`}
                >
                  <span className="text-base">{status.icon}</span>
                  <span className="hidden xs:inline sm:inline">
                    {status.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Repeat Type</h4>
          <div className="flex flex-wrap gap-2">
            {ALARM_REPEAT_FILTERS.map((repeatType) => {
              const isSelected = filters.repeat_type === repeatType.value;
              return (
                <motion.button
                  key={repeatType.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRepeatTypeFilter(repeatType.value)}
                  className={`flex items-center gap-2 px-3 py-2 ${
                    theme === "Samsung" && "rounded-full"
                  } ${theme === "Xiaomi" && "rounded-lg"} ${
                    theme === "Apple" && "rounded-full"
                  } text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-500 text-white shadow-sm"
                      : currentTheme.filterOptionColorsClassNames
                  }`}
                >
                  <span className="text-base">{repeatType.icon}</span>
                  {repeatType.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </>
    );

    return (
      <currentTheme.layout
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        bgColor={theme === "Apple" ? "bg-white" : "bg-gray-100"}
      >
        <MobileSearchAndFilterHeader
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder={currentTheme.searchPlaceholder}
          customFilterElements={customFilterElements}
          onClearFilters={onClearFilters}
          hasActiveFilters={hasActiveFilters}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
          resultsCount={totalAlarms}
          resultsLabel="alarms"
          theme={currentTheme.theme as "Samsung" | "Xiaomi" | "Apple"}
          classOverrides={
            theme === "Xiaomi"
              ? {
                  containerClass:
                    "bg-gray-100 rounded-2xl w-full mx-auto pt-2 pb-2 mb-2",
                  inputClass:
                    "border border-gray-300 focus:border-gray-300 text-stone-900 bg-gray-200",
                  sortButtonClass:
                    "hover:bg-gray-300/40 border border-gray-300 bg-gray-200",
                  filterContainerClass: "px-4 space-y-3",
                }
              : theme === "Apple"
                ? {
                    containerClass: "bg-[#F5F5F5] rounded-2xl mx-5 ",
                    inputClass:
                      " w-full pl-10 pr-10 py-3 text-black focus:bg-white rounded-xl text-sm bg-[#E9E9EA] focus:outline-none transition-all duration-200",
                    sortButtonClass:
                      "flex items-center gap-2 px-4 py-3  rounded-xl text-sm font-medium bg-[#1E1E1E] hover:bg-[#2e2e2e] hover:cursor-pointer transition-all duration-200",
                  }
                : {}
          }
        />
        {children}
      </currentTheme.layout>
    );
  },
);

AlarmsLayout.displayName = "AlarmsLayout";

export default AlarmsLayout;
