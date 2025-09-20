import React from "react";
import { motion } from "framer-motion";
import { Phone, Search, UserPlus } from "lucide-react";

interface ContactsEmptyStateProps {
  hasSearchQuery?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
}

const ContactsEmptyState: React.FC<ContactsEmptyStateProps> = ({
  hasSearchQuery = false,
  searchQuery = "",
  onClearSearch,
}) => {
  if (hasSearchQuery) {
    // Empty state for search/filter with no results
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No contacts found
        </h3>
        <p className="text-gray-500 text-center mb-6 max-w-sm">
          No contacts match your search for "{searchQuery}". Try adjusting your
          search terms or filters.
        </p>
        {onClearSearch && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Clear search
          </motion.button>
        )}
      </motion.div>
    );
  }

  // Empty state for no contacts at all
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-6">
        <Phone className="w-12 h-12 text-blue-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No contacts yet
      </h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        Your contacts will appear here once they're loaded from the backup. This
        may take a few moments.
      </p>
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <UserPlus className="w-4 h-4" />
        <span>Contacts are being processed...</span>
      </div>
    </motion.div>
  );
};

export default ContactsEmptyState;
