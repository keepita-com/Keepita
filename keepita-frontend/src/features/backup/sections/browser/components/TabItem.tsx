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
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
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
  const tabThemes = {
    Samsung: {
      containerClassNames:
        "bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-150",
      titleClassNames: "font-medium text-gray-900 text-[16px] leading-tight",
      urlClassNames: "text-[14px] text-blue-600 mb-2 truncate",
      link: {
        wrapperClassNames:
          "p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors",
        iconClassNames: "w-4 h-4 text-blue-600",
      },
      incognitoClassNames:
        "px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-[10px] font-medium",
      pinnedClassNames:
        "px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-[10px] font-medium",
      pinnIconClassNames: "w-4 h-4 text-orange-500 flex-shrink-0",
      incognitoIconClassNames: "w-4 h-4 text-gray-500 flex-shrink-0",
    },
    Xiaomi: {
      containerClassNames: "bg-red-50 p-4",
      titleClassNames: "font-medium text-stone-700 text-[16px] leading-tight",
      urlClassNames: "text-[14px] text-stone-700 mb-2 truncate",
      link: {
        wrapperClassNames:
          "p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors",
        iconClassNames: "w-4 h-4 text-stone-600",
      },
      incognitoClassNames:
        "px-2 py-1 bg-red-100 text-stone-700 rounded-full text-[10px] font-medium",
      pinnedClassNames:
        "px-2 py-1 bg-red-100 text-stone-700 rounded-full text-[10px] font-medium",
      pinnIconClassNames: "w-3 h-3 text-stone-700 flex-shrink-0",
      incognitoIconClassNames: "w-3 h-3 text-stone-700 flex-shrink-0",
    },
    Apple: {
      containerClassNames:
        "bg-white rounded-2xl p-4 px-10 py-5 hover:bg-[#E9E9EA] transition-colors duration-150",
      titleClassNames: "font-medium text-black text-xl leading-tight",
      urlClassNames: "text-sm text-blue-500 truncate",
      link: {
        wrapperClassNames:
          "p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors",
        iconClassNames: "w-4 h-4 text-blue-600",
      },
      incognitoClassNames:
        "px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-[10px] font-medium",
      pinnedClassNames:
        "px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-[10px] font-medium",
      pinnIconClassNames: "w-4 h-4 text-orange-500 flex-shrink-0",
      incognitoIconClassNames: "w-4 h-4 text-gray-500 flex-shrink-0",
    },
  };
  const currentTheme = tabThemes[theme];
  return (
    <div className={currentTheme.containerClassNames}>
      <div className="flex items-start space-x-3">
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <h3 className={currentTheme.titleClassNames}>
                {highlightText(tab.title, searchQuery)}
              </h3>
              {tab.is_pinned && (
                <Pin className={currentTheme.pinnIconClassNames} />
              )}
              {tab.is_incognito && (
                <EyeOff className={currentTheme.incognitoIconClassNames} />
              )}
            </div>

            {theme === "Apple" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={currentTheme.link.wrapperClassNames}
                onClick={() => window.open(tab.url, "_blank")}
              >
                <ExternalLink className={currentTheme.link.iconClassNames} />
              </motion.button>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <p className={currentTheme.urlClassNames}>
              {highlightText(formatUrl(tab.url), searchQuery)}
            </p>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-[12px] text-gray-400">
                Last accessed {formatRelativeTime(tab.last_accessed)}
              </span>
              {tab.is_pinned && (
                <span className={currentTheme.pinnedClassNames}>Pinned</span>
              )}
              {tab.is_incognito && (
                <span className={currentTheme.incognitoClassNames}>
                  Incognito
                </span>
              )}
            </div>
          </div>

          {theme !== "Apple" && (
            <div className="flex items-center justify-end mt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={currentTheme.link.wrapperClassNames}
                onClick={() => window.open(tab.url, "_blank")}
              >
                <ExternalLink className={currentTheme.link.iconClassNames} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabItem;
