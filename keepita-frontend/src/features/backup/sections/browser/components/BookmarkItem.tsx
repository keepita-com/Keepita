import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Info } from "lucide-react";
import {
  formatRelativeTime,
  formatUrl,
  getFaviconUrl,
} from "../utils/browser.utils";
import type { Bookmark } from "../types/browser.types";

interface BookmarkItemProps {
  bookmark: Bookmark;
  searchQuery: string;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({
  bookmark,
  searchQuery,
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

  const itemTheme = {
    Samsung: {
      containerClassNames:
        "bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-150",
      titleClassNames:
        "font-medium text-gray-900 text-[16px] leading-tight mb-1",
      urlClassNames: "text-[14px] text-blue-600 mb-2 truncate",
      linkIconClassNames: "w-4 h-4 text-blue-600",
      linkIconWrapperClassNames:
        "p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors",
      useInfoIcon: false,
    },
    Xiaomi: {
      containerClassNames: "bg-red-50 p-3",
      titleClassNames:
        "font-medium text-stone-700 text-[16px] leading-tight mb-1",
      urlClassNames: "text-[14px] text-stone-700 mb-2 truncate",
      linkIconClassNames: "w-4 h-4 text-stone-700",
      linkIconWrapperClassNames:
        "p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors",
      useInfoIcon: false,
    },
    Apple: {
      containerClassNames:
        "bg-white rounded-2xl p-4 px-10 py-5 hover:bg-[#E9E9EA] transition-colors duration-150",
      titleClassNames: "font-medium text-black text-xl leading-tight",
      urlClassNames: "text-sm text-blue-500 truncate",
      linkIconClassNames: "w-4 h-4 text-blue-600",
      linkIconWrapperClassNames:
        "p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors",
      useInfoIcon: true,
    },
  };

  const currentTheme = itemTheme[theme];

  return (
    <>
      <div className={currentTheme.containerClassNames}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <img
              src={getFaviconUrl(bookmark.url)}
              alt={`${bookmark.title} favicon`}
              className="w-8 h-8 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjOEU4RTkzIi8+Cjwvc3ZnPgo=";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h3 className={currentTheme.titleClassNames}>
                {highlightText(bookmark.title, searchQuery)}
              </h3>

              {theme === "Apple" && (
                <div className="flex items-center space-x-2 text-sm text-gray-400 flex-shrink-0">
                  <span>Added {formatRelativeTime(bookmark.created_at)}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 transition-colors"
                    aria-label="Show bookmark details"
                  >
                    <Info className="w-6 h-6 text-blue-600" />
                  </motion.button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-1">
              <p className={currentTheme.urlClassNames}>
                {highlightText(formatUrl(bookmark.url), searchQuery)}
              </p>

              {bookmark.folder && (
                <span className="text-[12px] text-gray-400 flex-shrink-0">
                  Folder: {bookmark.folder}
                </span>
              )}
            </div>

            {theme !== "Apple" && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-4 text-[12px] text-gray-400">
                  <span>Added {formatRelativeTime(bookmark.created_at)}</span>
                  {bookmark.folder && (
                    <span className="flex items-center">
                      Folder: {bookmark.folder}
                    </span>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={currentTheme.linkIconWrapperClassNames}
                  onClick={() => window.open(bookmark.url, "_blank")}
                  aria-label="Open in new tab"
                >
                  <ExternalLink className={currentTheme.linkIconClassNames} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-4 border-b border-gray-300" />
    </>
  );
};

export default BookmarkItem;
