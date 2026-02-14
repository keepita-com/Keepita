import React from "react";
import { motion } from "framer-motion";
import { Search, ExternalLink, Info } from "lucide-react";
import { formatRelativeTime } from "../utils/browser.utils";
import type { SearchQuery } from "../types/browser.types";

interface SearchItemProps {
  searchQuery: SearchQuery;
  highlightQuery: string;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const SearchItem: React.FC<SearchItemProps> = ({
  searchQuery,
  highlightQuery,
  theme = "Samsung",
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
      ),
    );
  };

  const searchThemes = {
    Samsung: {
      containerClassNames:
        "bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-150",
      searchTermClassNames:
        "font-medium text-gray-900 text-[16px] leading-tight mb-2",
      searchIconWrapperClassNames:
        "w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center",
      searchIconClassNames: "w-4 h-4 text-purple-600",
      searchEngineClassNames:
        "px-2 py-1 bg-gray-200 rounded-full text-[10px] font-medium",
      link: {
        wrapperClassNames:
          "p-2 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors",
        iconClassNames: "w-4 h-4 text-purple-600",
      },
    },
    Xiaomi: {
      containerClassNames: "bg-red-50 p-4",
      searchTermClassNames:
        "font-medium text-stone-700 text-[16px] leading-tight mb-2",
      searchIconWrapperClassNames:
        "w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center",
      searchIconClassNames: "w-4 h-4 text-stone-700",
      searchEngineClassNames:
        "px-2 py-1 bg-red-100 rounded-full text-[10px] font-medium text-stone-700",
      link: {
        wrapperClassNames:
          "p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors",
        iconClassNames: "w-4 h-4 text-stone-700",
      },
    },
    Apple: {
      containerClassNames:
        "bg-white rounded-2xl p-4 px-10 py-5 hover:bg-[#E9E9EA] transition-colors duration-150",
      searchTermClassNames: "font-medium text-black text-xl leading-tight",
      searchIconWrapperClassNames:
        "w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center",
      searchIconClassNames: "w-4 h-4 text-blue-600",
      searchEngineClassNames:
        "px-2 py-1 bg-gray-200 rounded-full text-[10px] font-medium text-gray-400",
      link: {
        wrapperClassNames:
          "p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors",
        iconClassNames: "w-5 h-5 text-blue-600",
      },
    },
  };
  const currentTheme = searchThemes[theme];
  return (
    <div className={currentTheme.containerClassNames}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div className={currentTheme.searchIconWrapperClassNames}>
            <Search className={currentTheme.searchIconClassNames} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h3 className={currentTheme.searchTermClassNames}>
              {highlightText(searchQuery.search_term, highlightQuery)}
            </h3>

            {theme === "Apple" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={currentTheme.link.wrapperClassNames}
                onClick={() => window.open(searchQuery.url, "_blank")}
              >
                <Info className={currentTheme.link.iconClassNames} />
              </motion.button>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <div></div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-[12px] text-gray-400">
                Searched {formatRelativeTime(searchQuery.search_time)}
              </span>
              <span className={currentTheme.searchEngineClassNames}>
                {searchQuery.search_engine}
              </span>
            </div>
          </div>

          {theme !== "Apple" && (
            <div className="flex items-center justify-end mt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={currentTheme.link.wrapperClassNames}
                onClick={() => window.open(searchQuery.url, "_blank")}
              >
                <ExternalLink className={currentTheme.link.iconClassNames} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
      <hr className="mt-4 border-gray-200" />
    </div>
  );
};

export default SearchItem;
