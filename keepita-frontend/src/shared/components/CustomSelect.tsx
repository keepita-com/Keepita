import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  width?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  icon,
  className,
  width = "w-full",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", width, className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between bg-gray-800/50 border rounded-xl px-4 py-2.5 text-sm transition-all duration-200",
          "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none",
          isOpen
            ? "border-blue-500/50 ring-2 ring-blue-500/20 bg-gray-800"
            : "border-gray-700/50 hover:bg-gray-800 hover:border-gray-600",
          selectedOption ? "text-white" : "text-gray-400",
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {icon && <span className="text-gray-500">{icon}</span>}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon && (
                <span className={cn(selectedOption.color)}>
                  {selectedOption.icon}
                </span>
              )}
              <span>{selectedOption.label}</span>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2",
            isOpen && "rotate-180 text-blue-400",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-[#1c252e] border border-gray-700/50 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden py-1"
          >
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left",
                    "hover:bg-white/5",
                    value === option.value
                      ? "bg-blue-500/10 text-blue-100"
                      : "text-gray-300",
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {option.icon && (
                      <span className={cn(option.color || "text-gray-400")}>
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {value === option.value && (
                    <Check size={14} className="text-blue-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
