import React from "react";
import { motion } from "framer-motion";
import { Search, ExternalLink } from "lucide-react";
import { formatRelativeTime } from "../utils/browser.utils";
import type { SearchQuery } from "../types/browser.types";

interface SearchItemProps {
  searchQuery: SearchQuery;
  highlightQuery: string;
}

const SearchItem: React.FC<SearchItemProps> = ({
  searchQuery,
  highlightQuery,
}) => {
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-150">
      <div className="flex items-start space-x-3">
        {/* Search Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-purple-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Search Term */}
              <h3 className="font-medium text-gray-900 text-[16px] leading-tight mb-2">
                {highlightText(searchQuery.search_term, highlightQuery)}
              </h3>

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-[12px] text-gray-400">
                <span>
                  Searched {formatRelativeTime(searchQuery.search_time)}
                </span>
                <span className="px-2 py-1 bg-gray-200 rounded-full text-[10px] font-medium">
                  {searchQuery.search_engine}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors"
                onClick={() => window.open(searchQuery.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 text-purple-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchItem;
