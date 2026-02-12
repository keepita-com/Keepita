import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, Search, Calendar, Hash } from "lucide-react";
import {
  MESSAGE_FILTER_SECTIONS,
  MESSAGE_QUICK_FILTERS,
  type FilterField,
} from "../constants/message.constants";
import type { ChatListFilters } from "../types/message.types";

interface AdvancedMessageFiltersProps {
  filters: ChatListFilters;
  onFiltersChange: (filters: ChatListFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

export const AdvancedMessageFilters: React.FC<AdvancedMessageFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
  theme = "Samsung",
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleFilterChange = (key: string, value: unknown) => {
    onFiltersChange({ [key]: value } as ChatListFilters);
  };

  const themeConfig = {
    Samsung: {
      text: "text-black",
      border: "border-gray-200",
      bgInput: "bg-gray-50",
      focus: "focus:bg-white focus:border-blue-500",
      quickFilterActive: "bg-blue-50 border-blue-200 text-blue-700",
      quickFilterInactive: "border-gray-200 text-gray-700 hover:bg-gray-50",
      sectionBg: "bg-gray-50",
      sectionPadding: "p-5",
      sectionText: "text-gray-700",
      iconBg: "bg-blue-100 text-blue-600",
      closeBtn: "hover:bg-gray-100 text-gray-500",
    },
    Xiaomi: {
      text: "text-stone-700",
      border: "border-red-200",
      bgInput: "bg-gray-50",
      focus: "",
      quickFilterActive: "bg-red-300/50 text-stone-700 border-none",
      quickFilterInactive:
        "bg-red-200/50 border-none text-stone-700 hover:bg-red-200/80",
      sectionBg: "bg-red-100",
      sectionPadding: "p-4",
      sectionText: "text-stone-700",
      iconBg: "bg-red-100 text-stone-700",
      closeBtn: "text-stone-700",
    },
    Apple: {
      text: "text-gray-900",
      border: "border-gray-300",
      bgInput: "bg-gray-50",
      focus: "bg-[#0056CC] text-white",
      quickFilterActive: "text-white bg-[#007AFF]  ",  
      quickFilterInactive: "bg-white text-[#2F7CF5] ",  
      sectionBg: "bg-gray-50",
      sectionPadding: "p-5",
      sectionText: "text-gray-900",
      iconBg: "bg-blue-100 text-blue-600",
      closeBtn: "hover:bg-gray-100 text-gray-500",
    },
  };

  const cfg = themeConfig[theme];

  const renderFilterField = (field: FilterField) => {
    const value = (filters as Record<string, unknown>)[field.key] || "";

    const commonInputClass = `w-full pl-10 pr-10 py-3 border ${cfg.text} ${cfg.border} ${cfg.bgInput} rounded-xl text-sm focus:outline-none transition-all duration-200 ${cfg.focus}`;

    switch (field.type) {
      case "text":
        return (
          <div className="relative">
            <input
              type="text"
              value={value as string}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={commonInputClass}
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          </div>
        );
      case "number":
        return (
          <div className="relative">
            <input
              type="number"
              value={value as string}
              onChange={(e) =>
                handleFilterChange(
                  field.key,
                  e.target.value ? parseInt(e.target.value) : ""
                )
              }
              placeholder={field.placeholder}
              className={commonInputClass}
            />
            <Hash className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          </div>
        );
      case "date":
        return (
          <div className="relative">
            <input
              type="date"
              value={value as string}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
              className={commonInputClass}
            />
            <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          </div>
        );
      default:
        return null;
    }
  };

  const getActiveFiltersCount = () =>
    Object.keys(filters).filter(
      (key) =>
        key !== "page" &&
        key !== "limit" &&
        key !== "ordering" &&
        filters[key as keyof ChatListFilters] !== undefined
    ).length;

  return (
    <div className={`w-full ${theme === "Xiaomi" ? "px-4" : ""}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {MESSAGE_QUICK_FILTERS.map((filter) => {
            const IconComponent = filter.icon;
            const isActive =
              filters[filter.key as keyof ChatListFilters] ===
              filter.activeValue;
            return (
              <button
                key={filter.key}
                onClick={() =>
                  handleFilterChange(
                    filter.key,
                    isActive ? undefined : filter.value
                  )
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive ? cfg.quickFilterActive : cfg.quickFilterInactive
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg  transition-all ${
            isOpen || getActiveFiltersCount() > 3
              ? cfg.quickFilterActive
              : cfg.quickFilterInactive
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium ">More Filters</span>
          {getActiveFiltersCount() > 3 && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {getActiveFiltersCount() - 3}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`w-full mt-3 overflow-hidden border rounded-xl shadow-lg ${
              theme === "Samsung"
                ? "bg-white border-gray-200"
                : "bg-gray-100 border-red-200/50"
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center`}
                  >
                    <Filter className="w-4 h-4" />
                  </div>
                  <h3 className={`text-lg font-semibold ${cfg.sectionText}`}>
                    Advanced Filters
                  </h3>
                </div>
                <button
                  onClick={onToggle}
                  className={`p-2 ${cfg.closeBtn} rounded-lg transition-colors`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                {MESSAGE_FILTER_SECTIONS.map((section) => (
                  <div
                    key={section.title}
                    className={`${cfg.sectionBg} ${cfg.sectionPadding} rounded-xl border border-gray-200`}
                  >
                    <button
                      onClick={() =>
                        setActiveSection(
                          activeSection === section.title ? null : section.title
                        )
                      }
                      className={`flex items-center gap-3 w-full text-left mb-4`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg ${cfg.iconBg} shadow-sm flex items-center justify-center`}
                      >
                        {section.icon}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 ml-auto transition-transform ${
                          activeSection === section.title ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeSection === section.title && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                            {section.fields.map((field) => (
                              <div key={field.key} className="space-y-2">
                                <label
                                  className={`block text-sm font-medium ${cfg.sectionText}`}
                                >
                                  {field.label}
                                </label>
                                {renderFilterField(field)}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
