/**
 * SamsungAdvancedMessageFilters.tsx
 * Advanced filter component using the defined filter constants
 */
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
}

export const AdvancedMessageFilters: React.FC<
  AdvancedMessageFiltersProps
> = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const handleFilterChange = (key: string, value: any) => {
    // Always send a partial update with the specific key
    const partialUpdate = { [key]: value };
    onFiltersChange(partialUpdate);
  };

  const renderFilterField = (field: FilterField) => {
    const value = (filters as any)[field.key] || "";

    switch (field.type) {
      case "text":
        return (
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full pl-10 pr-10 py-3 border text-black border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200"
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          </div>
        );

      case "number":
        return (
          <div className="relative">
            <input
              type="number"
              value={value}
              onChange={(e) =>
                handleFilterChange(
                  field.key,
                  e.target.value ? parseInt(e.target.value) : ""
                )
              }
              placeholder={field.placeholder}
              className="w-full pl-10 pr-10 py-3 border text-black border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200"
            />
            <Hash className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          </div>
        );

      case "date":
        return (
          <div className="relative">
            <input
              type="date"
              value={value}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
              className="w-full pl-10 pr-10 py-3 border text-black border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200"
            />
            <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          </div>
        );

      default:
        return null;
    }
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(
      (key) =>
        key !== "page" &&
        key !== "limit" &&
        key !== "ordering" &&
        filters[key as keyof ChatListFilters] !== undefined
    ).length;
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3">
        {/* Quick Boolean Filters */}
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

        {/* Advanced Filters Button */}
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
            isOpen || getActiveFiltersCount() > 3
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">More Filters</span>
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

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full mt-3 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-lg"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Filter className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Advanced Filters
                  </h3>
                </div>
                <button
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Filter Sections */}
              <div className="space-y-6">
                {MESSAGE_FILTER_SECTIONS.map((section) => (
                  <div
                    key={section.title}
                    className="bg-gray-50 rounded-xl p-5 border border-gray-200"
                  >
                    <button
                      onClick={() =>
                        setActiveSection(
                          activeSection === section.title ? null : section.title
                        )
                      }
                      className="flex items-center gap-3 w-full text-left mb-4"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 shadow-sm flex items-center justify-center">
                        {section.icon}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 ml-auto transition-transform  text-blue-600  ${
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 ">
                            {section.fields.map((field) => (
                              <div key={field.key} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  {field.label}
                                </label>
                                <div className="relative">
                                  {renderFilterField(field)}
                                </div>
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
