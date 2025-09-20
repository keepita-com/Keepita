/**
 * SamsungAdvancedConversationFilters.tsx
 * Advanced filter component for filtering messages within a conversation
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, Search, Calendar, Hash } from "lucide-react";
import {
  MESSAGE_CONVERSATION_FILTER_SECTIONS,
  type FilterField,
} from "../constants/message.constants";
import type { ChatMessageFilters } from "../types/message.types";

interface AdvancedConversationFiltersProps {
  filters: ChatMessageFilters;
  onFiltersChange: (filters: ChatMessageFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const AdvancedConversationFilters: React.FC<
  AdvancedConversationFiltersProps
> = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters };

    if (value === "" || value === null || value === undefined) {
      delete newFilters[key as keyof ChatMessageFilters];
    } else {
      (newFilters as any)[key] = value;
    }

    onFiltersChange(newFilters);
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
        key !== "page_size" &&
        key !== "ordering" &&
        filters[key as keyof ChatMessageFilters] !== undefined
    ).length;
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Advanced Filters Button */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
          isOpen || getActiveFiltersCount() > 2
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">More Filters</span>
        {getActiveFiltersCount() > 2 && (
          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {getActiveFiltersCount() - 2}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform  ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

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
                {MESSAGE_CONVERSATION_FILTER_SECTIONS.map((section) => (
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
                        className={`w-4 h-4 ml-auto transition-transform  text-blue-600 ${
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
                          className="overflow-hidden p-2"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
