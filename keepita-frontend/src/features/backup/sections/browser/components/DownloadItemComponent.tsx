import React from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, File } from "lucide-react";
import {
  formatRelativeTime,
  formatUrl,
  formatFileSize,
} from "../utils/browser.utils";
import type { DownloadItem } from "../types/browser.types";

interface DownloadItemComponentProps {
  downloadItem: DownloadItem;
  searchQuery: string;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const DownloadItemComponent: React.FC<DownloadItemComponentProps> = ({
  downloadItem,
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

  const getProgressPercentage = () => {
    if (downloadItem.total_bytes === 0) return 0;
    return Math.round(
      (downloadItem.bytes_downloaded / downloadItem.total_bytes) * 100,
    );
  };

  const downloadItemThemes = {
    Samsung: {
      containerClassNames:
        "bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-150",
      fileNameClassNames:
        "font-medium text-gray-900 text-[16px] leading-tight mb-1",
      url: "text-[14px] text-blue-600 mb-2 truncate",
      fileIconWrapperClassNames:
        "w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center",
      fileIconClassNames: "w-4 h-4 text-blue-600",
      link: {
        wrapperClassNames:
          "p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors",
        icon: "w-4 h-4 text-blue-600",
      },
      defaultStateColor: "bg-gray-100 text-gray-800",
    },
    Xiaomi: {
      containerClassNames: "bg-red-50 p-4",
      fileNameClassNames:
        "font-medium text-stone-700 text-[16px] leading-tight mb-1",
      url: "text-[14px] text-stone-700 mb-2 truncate",
      fileIconWrapperClassNames:
        "w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center",
      fileIconClassNames: "w-4 h-4 text-stone-700",
      link: {
        wrapperClassNames: "p-2 bg-red-100 hover:bg-red-200 rounded-full",
        icon: "w-4 h-4 text-stone-700",
      },
      defaultStateColor: "bg-red-100 text-stone-700",
    },
    Apple: {
      containerClassNames:
        "bg-white rounded-2xl p-4 px-10 py-5 hover:bg-[#E9E9EA] transition-colors duration-150",
      fileNameClassNames: "font-medium text-black text-xl leading-tight",
      url: "text-sm text-blue-500 truncate",
      fileIconWrapperClassNames:
        "w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center",
      fileIconClassNames: "w-4 h-4 text-blue-600",
      link: {
        wrapperClassNames:
          "p-2 rounded-full bg-transparent hover:bg-[#E9E9EA] transition-colors",
        icon: "w-4 h-4 text-blue-600 ",
      },
      defaultStateColor: "bg-trasparent text-black",
    },
  };

  const currentTheme = downloadItemThemes[theme];

  const getStateColor = (state: string) => {
    switch (state) {
      case "COMPLETE":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return currentTheme.defaultStateColor;
    }
  };

  return (
    <div className={currentTheme.containerClassNames}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div className={currentTheme.fileIconWrapperClassNames}>
            <File className={currentTheme.fileIconClassNames} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h3 className={currentTheme.fileNameClassNames}>
              {highlightText(downloadItem.file_name, searchQuery)}
            </h3>

            {theme === "Apple" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={currentTheme.link.wrapperClassNames}
                onClick={() => window.open(downloadItem.url, "_blank")}
              >
                <ExternalLink className={currentTheme.link.icon} />
              </motion.button>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <p className={currentTheme.url}>
              {highlightText(formatUrl(downloadItem.url), searchQuery)}
            </p>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-[12px] text-gray-400 flex items-center">
                <Download className="w-3 h-3 mr-1" />
                {formatRelativeTime(downloadItem.download_time)}
              </span>
              <span className="text-[12px] text-gray-400">
                {formatFileSize(downloadItem.total_bytes)}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-[10px] font-medium ${getStateColor(
                  downloadItem.state,
                )}`}
              >
                {downloadItem.state.replace("_", " ")}
              </span>
              {downloadItem.mime_type && (
                <span className="px-2 py-1 bg-gray-200 rounded-full text-[10px] text-gray-400">
                  {downloadItem.mime_type}
                </span>
              )}
            </div>
          </div>

          {downloadItem.state === "IN_PROGRESS" && (
            <div className="mt-2">
              <div className="flex justify-between text-[12px] text-gray-500 mb-1">
                <span>{getProgressPercentage()}%</span>
                <span>
                  {formatFileSize(downloadItem.bytes_downloaded)} /{" "}
                  {formatFileSize(downloadItem.total_bytes)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}

          {theme === "Apple" && (
            <p className="text-[12px] text-gray-400 mt-1 truncate">
              {highlightText(downloadItem.target_path, searchQuery)}
            </p>
          )}

          {theme !== "Apple" && (
            <div className="flex items-center justify-end mt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={currentTheme.link.wrapperClassNames}
                onClick={() => window.open(downloadItem.url, "_blank")}
              >
                <ExternalLink className={currentTheme.link.icon} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
      <hr className="mt-4 border-gray-200" />
    </div>
  );
};

export default DownloadItemComponent;
