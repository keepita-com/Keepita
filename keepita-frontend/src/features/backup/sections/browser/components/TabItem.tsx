import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Pin, EyeOff } from "lucide-react";
import {
  formatRelativeTime,
  formatUrl,
  getFaviconUrl,
} from "../utils/browser.utils";
import type { BrowserTab } from "../types/browser.types";

interface TabItemProps {
  tab: BrowserTab;
  searchQuery: string;
}

const TabItem: React.FC<TabItemProps> = ({ tab, searchQuery }) => {
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
            src={getFaviconUrl(tab.url)}
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
              {/* Title with badges */}
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-gray-900 text-[16px] leading-tight">
                  {highlightText(tab.title, searchQuery)}
                </h3>
                {tab.is_pinned && (
                  <Pin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                )}
                {tab.is_incognito && (
                  <EyeOff className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </div>

              {/* URL */}
              <p className="text-[14px] text-blue-600 mb-2 truncate">
                {highlightText(formatUrl(tab.url), searchQuery)}
              </p>

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-[12px] text-gray-400">
                <span>
                  Last accessed {formatRelativeTime(tab.last_accessed)}
                </span>
                {tab.is_pinned && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-[10px] font-medium">
                    Pinned
                  </span>
                )}
                {tab.is_incognito && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-[10px] font-medium">
                    Incognito
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
                onClick={() => window.open(tab.url, "_blank")}
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

export default TabItem;
