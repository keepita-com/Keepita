import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Clock } from "lucide-react";
import {
  formatRelativeTime,
  formatUrl,
  getFaviconUrl,
} from "../utils/browser.utils";
import type { HistoryEntry } from "../types/browser.types";

interface HistoryItemProps {
  historyEntry: HistoryEntry;
  searchQuery: string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  historyEntry,
  searchQuery,
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
        {/* Favicon */}
        <div className="flex-shrink-0 mt-1">
          <img
            src={getFaviconUrl(historyEntry.url)}
            alt=""
            className="w-8 h-8 rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjOEU4RTkzIi8+Cjwvc3ZnPgo=";
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="font-medium text-gray-900 text-[16px] leading-tight mb-1">
                {highlightText(historyEntry.title, searchQuery)}
              </h3>

              {/* URL */}
              <p className="text-[14px] text-blue-600 mb-2 truncate">
                {highlightText(formatUrl(historyEntry.url), searchQuery)}
              </p>

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-[12px] text-gray-400">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatRelativeTime(historyEntry.last_visit_time)}
                </span>
                <span>{historyEntry.visit_count} visits</span>
                {historyEntry.source && (
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-[10px]">
                    {historyEntry.source}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
                onClick={() => window.open(historyEntry.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryItem;
