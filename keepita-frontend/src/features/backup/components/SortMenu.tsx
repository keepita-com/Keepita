import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileText, Archive, Database, Clock } from "lucide-react";
import SortIndicator from "./SortIndicator";

interface SortMenuProps {
  isOpen: boolean;
  activeField: string;
  direction: "asc" | "desc";
  onSort: (field: string) => void;
  onClose: () => void;
}

const SortMenu: React.FC<SortMenuProps> = ({
  isOpen,
  activeField,
  direction,
  onSort,
  onClose,
}) => {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        !(event.target as Element).closest(".sort-menu-container")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute right-0 mt-3 w-56 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-gray-700/40 shadow-2xl shadow-black/20 z-30 sort-menu-container"
        >
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-gray-700/30">
            <motion.h4
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-semibold text-white flex items-center"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-indigo-500 mr-2"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              Sort Options
            </motion.h4>
          </div>

          <div className="p-3">
            <div className="space-y-1">
              <SortIndicator
                field="created_at"
                activeField={activeField}
                direction={direction}
                onSort={onSort}
                label="Created Date"
              >
                <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
              </SortIndicator>

              <SortIndicator
                field="updated_at"
                activeField={activeField}
                direction={direction}
                onSort={onSort}
                label="Updated Date"
              >
                <Clock className="w-4 h-4 mr-2 text-indigo-400" />
              </SortIndicator>

              <SortIndicator
                field="name"
                activeField={activeField}
                direction={direction}
                onSort={onSort}
                label="Name"
              >
                <FileText className="w-4 h-4 mr-2 text-indigo-400" />
              </SortIndicator>

              <SortIndicator
                field="model_name"
                activeField={activeField}
                direction={direction}
                onSort={onSort}
                label="Model Name"
              >
                <Database className="w-4 h-4 mr-2 text-indigo-400" />
              </SortIndicator>

              <SortIndicator
                field="size"
                activeField={activeField}
                direction={direction}
                onSort={onSort}
                label="Size"
              >
                <Archive className="w-4 h-4 mr-2 text-indigo-400" />
              </SortIndicator>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SortMenu;
