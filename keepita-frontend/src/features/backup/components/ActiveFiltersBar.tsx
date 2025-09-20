import { motion } from "framer-motion";
import type { BackupFilters } from "../components/SearchAndFilterBar";

interface ActiveFilterPillProps {
  label: string;
  fullLabel?: string;
  onRemove: () => void;
}

const ActiveFilterPill: React.FC<ActiveFilterPillProps> = ({
  label,
  fullLabel,
  onRemove,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center bg-indigo-600/40 text-white text-xs rounded-full py-1 px-3"
      title={fullLabel || label}
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 text-indigo-200 hover:text-white"
        aria-label="Remove filter"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </motion.div>
  );
};

interface ActiveFiltersBarProps {
  searchQuery: string;
  filters: BackupFilters;
  onRemoveFilter: (filterType: keyof BackupFilters | "search") => void;
  onClearAll: () => void;
  onRemoveDateRange?: () => void;
}

const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  searchQuery,
  filters,
  onRemoveFilter,
  onClearAll,
  onRemoveDateRange,
}) => {
  const hasFilters =
    searchQuery.trim() !== "" ||
    filters.status !== null ||
    filters.customDateFrom !== undefined ||
    filters.customDateTo !== undefined;

  if (!hasFilters) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-wrap gap-2 mb-4"
    >
      <div className="text-gray-400 text-sm mr-1 mt-1 hidden sm:block">
        Active Filters:
      </div>
      <div className="text-gray-400 text-sm mr-1 mt-1 sm:hidden">Filters:</div>

      {searchQuery.trim() !== "" && (
        <ActiveFilterPill
          label={`Search: ${
            searchQuery.length > 10
              ? searchQuery.substring(0, 10) + "..."
              : searchQuery
          }`}
          fullLabel={`Search: ${searchQuery}`}
          onRemove={() => onRemoveFilter("search")}
        />
      )}

      {filters.status && (
        <ActiveFilterPill
          label={`Status: ${
            filters.status.charAt(0).toUpperCase() + filters.status.slice(1)
          }`}
          onRemove={() => onRemoveFilter("status")}
        />
      )}

      {(filters.customDateFrom || filters.customDateTo) && (
        <ActiveFilterPill
          label={`Date Range: ${
            filters.customDateFrom
              ? new Date(filters.customDateFrom).toLocaleDateString()
              : "Start"
          } - ${
            filters.customDateTo
              ? new Date(filters.customDateTo).toLocaleDateString()
              : "End"
          }`}
          onRemove={() => {
            if (onRemoveDateRange) {
              onRemoveDateRange();
            } else {
              onRemoveFilter("customDateFrom");
              onRemoveFilter("customDateTo");
            }
          }}
        />
      )}

      {hasFilters && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearAll}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 px-3 rounded-full ml-auto"
        >
          Clear All
        </motion.button>
      )}
    </motion.div>
  );
};

export default ActiveFiltersBar;
