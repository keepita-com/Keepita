import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Clock, Info } from "lucide-react";
import {
  formatRelativeTime,
  formatUrl,
  getFaviconUrl,
} from "../utils/browser.utils";
import type { HistoryEntry } from "../types/browser.types";

interface HistoryItemProps {
  historyEntry: HistoryEntry;
  searchQuery: string;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  historyEntry,
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

  const historyItemTheme = {
    Samsung: {
      containerClassNames:
        "bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-150",
      title: "font-medium text-gray-900 text-[16px] leading-tight mb-1",
      url: "text-[14px] text-blue-600 mb-2 truncate",
      link: {
        linkWrapperClassNames:
          "p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors",
        linkIconClassNames: "w-4 h-4 text-blue-600",
      },
    },
    Xiaomi: {
      containerClassNames: "bg-red-50 p-4",
      title: "font-medium text-stone-700 text-[16px] leading-tight mb-1",
      url: "text-[14px] text-stone-700 mb-2 truncate",
      link: {
        linkWrapperClassNames:
          "p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors",
        linkIconClassNames: "w-4 h-4 text-stone-700",
      },
    },
    Apple: {
      containerClassNames:
        "bg-white rounded-2xl p-4 px-10 py-5 hover:bg-[#E9E9EA] transition-colors duration-150 ",
      title: "font-medium text-black text-xl leading-tight",
      url: "text-sm text-blue-500 truncate leading-none",
      link: {
        linkWrapperClassNames:
          "p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors",
        linkIconClassNames: "w-5 h-5 text-blue-600",
      },
    },
  };

  const currentTheme = historyItemTheme[theme];

  return (
    <div className={currentTheme.containerClassNames}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <img
            src={getFaviconUrl(historyEntry.url)}
            alt=""
            className="w-8 h-8 rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC5MSA4LjI2TDEyIDJaIiBmaWxsPSIjOEU4RTkzIi8+Cjwvc3ZnPgo=";
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h3 className={currentTheme.title}>
              {highlightText(historyEntry.title, searchQuery)}
            </h3>
          </div>

          <div className="flex items-center justify-between mt-1 min-w-0">
            <p className={`${currentTheme.url} min-w-0 flex-1`}>
              {highlightText(formatUrl(historyEntry.url), searchQuery)}
            </p>

            <div className="flex items-center space-x-3 flex-shrink-0 pl-3">
              <span className="text-[12px] text-gray-400 flex items-center whitespace-nowrap">
                <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                {formatRelativeTime(historyEntry.last_visit_time)}
              </span>
              <span className="text-[12px] text-gray-400 whitespace-nowrap">
                {historyEntry.visit_count} visits
              </span>
              {historyEntry.source && (
                <span className="px-3 py-1 text-[10px] text-gray-400 bg-gray-100 rounded-full">
                  {historyEntry.source}
                </span>
              )}

              {theme !== "Apple" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={currentTheme.link.linkWrapperClassNames}
                  onClick={() => window.open(historyEntry.url, "_blank")}
                >
                  <ExternalLink
                    className={currentTheme.link.linkIconClassNames}
                  />
                </motion.button>
              )}

              {theme === "Apple" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={currentTheme.link.linkWrapperClassNames}
                  onClick={() => window.open(historyEntry.url, "_blank")}
                >
                  <Info className={currentTheme.link.linkIconClassNames} />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
      <hr className="mt-4 border-gray-200" />
    </div>
  );
};

export default HistoryItem;
