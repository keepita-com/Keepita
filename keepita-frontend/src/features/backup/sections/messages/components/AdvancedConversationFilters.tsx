import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, Search, Calendar, Hash } from "lucide-react";
import {
  MESSAGE_CONVERSATION_FILTER_SECTIONS,
  type FilterField,
} from "../constants/message.constants";
import type { ChatMessageFilters } from "../types/message.types";

type Theme = "Samsung" | "Xiaomi" | "Apple";

interface AdvancedConversationFiltersProps {
  filters: ChatMessageFilters;
  onFiltersChange: (filters: ChatMessageFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
  theme?: Theme;
}

export const AdvancedConversationFilters: React.FC<
  AdvancedConversationFiltersProps
> = ({ filters, onFiltersChange, isOpen, onToggle, theme = "Samsung" }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleFilterChange = (key: string, value: unknown) => {
    const newFilters = { ...filters };

    if (value === "" || value === null || value === undefined) {
      delete newFilters[key as keyof ChatMessageFilters];
    } else {
      (newFilters as Record<string, unknown>)[key] = value;
    }

    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(
      (key) =>
        key !== "page" &&
        key !== "page_size" &&
        key !== "ordering" &&
        filters[key as keyof ChatMessageFilters] !== undefined,
    ).length;
  };

  const themeConfig = {
    Samsung: {
      advancedButtonClass: (condition: boolean) =>
        `flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
          condition
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        }`,
      panelClass:
        "w-full mt-3 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-lg",
      headerIconContainerClass:
        "w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center",
      headerIconClass: "w-4 h-4 text-blue-600",
      headerTitleClass: "text-lg font-semibold text-gray-900",
      closeButtonClass: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
      closeIconClass: "w-4 h-4 text-gray-500",
      sectionClass: "bg-gray-50 rounded-xl p-5 border border-gray-200",
      sectionButtonClass: "flex items-center gap-3 w-full text-left mb-4",
      sectionIconContainerClass:
        "w-6 h-6 rounded-lg bg-blue-100 text-blue-600 shadow-sm flex items-center justify-center",
      sectionTitleClass: "font-semibold text-gray-900",
      sectionChevronClass: "w-4 h-4 ml-auto transition-transform text-blue-600",
      labelClass: "block text-sm font-medium text-gray-700",
      inputClasses: {
        text: "text-black border-gray-200 focus:bg-white focus:border-blue-500",
        date: "text-black border-gray-200 focus:border-blue-500 focus:bg-white",
        number:
          "text-black border-gray-200 focus:bg-white focus:border-blue-500",
      },
    },
    Xiaomi: {
      advancedButtonClass: (condition: boolean) =>
        `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
          condition
            ? "bg-red-300/50 text-stone-700"
            : "bg-red-200/50 text-stone-700"
        }`,
      panelClass:
        "w-full mt-3 overflow-hidden bg-gray-100 border border-red-200/50 rounded-xl shadow-lg",
      headerIconContainerClass:
        "w-8 h-8 rounded-lg bg-red-200/50 flex items-center justify-center",
      headerIconClass: "w-4 h-4 text-stone-700",
      headerTitleClass: "text-lg font-semibold text-stone-700",
      closeButtonClass:
        "p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer",
      closeIconClass: "w-4 h-4 text-stone-700",
      sectionClass: "bg-red-100 rounded-xl p-4 border border-gray-200",
      sectionButtonClass: "flex items-center gap-3 w-full text-left mb-0",
      sectionIconContainerClass:
        "w-6 h-6 rounded-lg bg-red-100 text-stone-700 shadow-sm flex items-center justify-center",
      sectionTitleClass: "font-semibold text-stone-700",
      sectionChevronClass:
        "w-4 h-4 ml-auto transition-transform text-stone-700",
      labelClass: "block text-sm font-medium text-stone-800",
      inputClasses: {
        text: "text-stone-700 border-red-100 focus:border-red-200",
        date: "text-stone-700 border-red-100 focus:border-red-200",
        number: "text-stone-700 border-red-100 focus:border-red-200",
      },
    },
    Apple: {
      advancedButtonClass: (condition: boolean) =>
        `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-sm shadow-sm ${
          condition
            ? "bg-[#0061D9] text-white border-[#0061D9]"
            : "bg-[#007AFF] text-white border-[#007AFF] hover:bg-[#0066D6] hover:shadow-md"
        }`,

      panelClass:
        "w-full mt-3 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-lg",
      headerIconContainerClass:
        "w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center",
      headerIconClass: "w-4 h-4 text-blue-600",
      headerTitleClass: "text-lg font-semibold text-gray-900",
      closeButtonClass: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
      closeIconClass: "w-4 h-4 text-gray-500",
      sectionClass: "bg-gray-50 rounded-xl p-5 border border-gray-200",
      sectionButtonClass: "flex items-center gap-3 w-full text-left mb-4",
      sectionIconContainerClass:
        "w-6 h-6 rounded-lg bg-blue-100 text-blue-600 shadow-sm flex items-center justify-center",
      sectionTitleClass: "font-semibold text-gray-900",
      sectionChevronClass: "w-4 h-4 ml-auto transition-transform text-blue-600",
      labelClass: "block text-sm font-medium text-gray-700",
      inputClasses: {
        text: "text-gray-900 border-gray-300 focus:bg-white focus:border-blue-500",
        date: "text-gray-900 border-gray-300 focus:border-blue-500 focus:bg-white",
        number:
          "text-gray-900 border-gray-300 focus:bg-white focus:border-blue-500",
      },
    },
  };

  const currentTheme = themeConfig[theme];

  const renderFilterField = (field: FilterField) => {
    const value = (filters as Record<string, unknown>)[field.key] || "";
    const inputClass =
      currentTheme.inputClasses[field.type as "text" | "number" | "date"];

    switch (field.type) {
      case "text":
        return (
          <div className="relative">
            <input
              type="text"
              value={value as string}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full pl-10 pr-10 py-3 border ${inputClass} rounded-xl text-sm bg-gray-50 focus:outline-none transition-all duration-200`}
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
                  e.target.value ? parseInt(e.target.value) : "",
                )
              }
              placeholder={field.placeholder}
              className={`w-full pl-10 pr-10 py-3 border ${inputClass} rounded-xl text-sm bg-gray-50 focus:outline-none transition-all duration-200`}
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
              className={`w-full pl-10 pr-10 py-3 border ${inputClass} rounded-xl text-sm bg-gray-50 focus:outline-none transition-all duration-200`}
            />
            <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={onToggle}
        className={currentTheme.advancedButtonClass(
          isOpen || getActiveFiltersCount() > 2,
        )}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">More Filters</span>
        {getActiveFiltersCount() > 2 && (
          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {getActiveFiltersCount() - 2}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={currentTheme.panelClass}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={currentTheme.headerIconContainerClass}>
                    <Filter className={currentTheme.headerIconClass} />
                  </div>
                  <h3 className={currentTheme.headerTitleClass}>
                    Advanced Filters
                  </h3>
                </div>
                <button
                  onClick={onToggle}
                  className={currentTheme.closeButtonClass}
                >
                  <X className={currentTheme.closeIconClass} />
                </button>
              </div>

              <div className="space-y-6">
                {MESSAGE_CONVERSATION_FILTER_SECTIONS.map((section) => (
                  <div
                    key={section.title}
                    className={currentTheme.sectionClass}
                  >
                    <button
                      onClick={() =>
                        setActiveSection(
                          activeSection === section.title
                            ? null
                            : section.title,
                        )
                      }
                      className={currentTheme.sectionButtonClass}
                    >
                      <div className={currentTheme.sectionIconContainerClass}>
                        {section.icon}
                      </div>
                      <span className={currentTheme.sectionTitleClass}>
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`${currentTheme.sectionChevronClass} ${
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
                                <label className={currentTheme.labelClass}>
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
