import React from "react";
import { motion } from "framer-motion";
import { Archive, Filter, Search, RefreshCw, RotateCcwKey } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  icon?: "no-backups" | "no-results" | "filter-no-match" | "api-key";
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  isFiltered = false,
  onClearFilters,
  icon = "no-backups",
}) => {
  const iconElements = {
    "no-backups": <Archive className="w-16 h-16 text-indigo-400" />,
    "no-results": <Search className="w-16 h-16 text-indigo-400" />,
    "filter-no-match": <Filter className="w-16 h-16 text-indigo-400" />,
    "api-key": <RotateCcwKey className="w-16 h-16 text-indigo-400" />,
  };

  const defaultTitles = {
    "no-backups": "No Backups Found",
    "no-results": "No Results Found",
    "filter-no-match": "No Matching Backups",
    "api-key": "You dont have any clients",
  };

  const defaultDescriptions = {
    "no-backups":
      "Create your first backup to ensure your data is safe.",
    "no-results": "We couldn't find any backups matching your search query.",
    "filter-no-match": "Try adjusting your filters to see more results.",
    "api-key": "Create your first client to start using API keys.",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.3,
      }}
      className="col-span-full flex flex-col items-center justify-center p-12 relative overflow-hidden"
    >
      <div className="relative z-10">
        {" "}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="rounded-full mb-4 sm:mb-6 backdrop-blur-sm shadow-inner flex justify-center"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-indigo-600/30 blur-lg rounded-full"></div>
              {iconElements[icon]}
            </div>
          </motion.div>
        </motion.div>{" "}
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 text-center"
        >
          {title || defaultTitles[icon]}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-gray-300 text-center text-sm sm:text-base mb-6 sm:mb-8 max-w-md px-4 sm:px-0"
        >
          {description || defaultDescriptions[icon]}
        </motion.p>
        {isFiltered && onClearFilters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center space-x-2 shadow-lg shadow-indigo-700/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Filters</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
