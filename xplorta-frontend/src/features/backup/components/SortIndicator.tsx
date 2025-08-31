import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

interface SortIndicatorProps {
  field: string;
  activeField: string;
  direction: "asc" | "desc";
  onSort: (field: string) => void;
  label: string;
  children?: React.ReactNode;
}

const SortIndicator: React.FC<SortIndicatorProps> = ({
  field,
  activeField,
  direction,
  onSort,
  label,
  children,
}) => {
  const isActive = field === activeField;

  return (
    <motion.button
      className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
        isActive
          ? "bg-indigo-600/30 text-white font-medium"
          : "bg-gray-800/30 text-gray-400 hover:bg-gray-800/60 hover:text-white"
      } transition-all`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSort(field)}
    >
      {children}
      <span>{label}</span>
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            key={`sort-${direction}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="ml-1"
          >
            {direction === "asc" ? (
              <ArrowUp className="w-4 h-4 text-indigo-300" />
            ) : (
              <ArrowDown className="w-4 h-4 text-indigo-300" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default SortIndicator;
