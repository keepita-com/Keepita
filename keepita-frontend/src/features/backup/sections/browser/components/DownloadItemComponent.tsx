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
}

const DownloadItemComponent: React.FC<DownloadItemComponentProps> = ({
  downloadItem,
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
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = () => {
    if (downloadItem.total_bytes === 0) return 0;
    return Math.round(
      (downloadItem.bytes_downloaded / downloadItem.total_bytes) * 100
    );
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-150">
      <div className="flex items-start space-x-3">
        {/* File Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <File className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* File Name */}
              <h3 className="font-medium text-gray-900 text-[16px] leading-tight mb-1">
                {highlightText(downloadItem.file_name, searchQuery)}
              </h3>

              {/* Target Path */}
              <p className="text-[14px] text-gray-600 mb-1 truncate">
                {highlightText(downloadItem.target_path, searchQuery)}
              </p>

              {/* URL */}
              <p className="text-[14px] text-blue-600 mb-2 truncate">
                {highlightText(formatUrl(downloadItem.url), searchQuery)}
              </p>

              {/* Progress Bar (if in progress) */}
              {downloadItem.state === "IN_PROGRESS" && (
                <div className="mb-2">
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

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-[12px] text-gray-400">
                <span>
                  <Download className="w-3 h-3 inline mr-1" />
                  {formatRelativeTime(downloadItem.download_time)}
                </span>
                <span>{formatFileSize(downloadItem.total_bytes)}</span>
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-medium ${getStateColor(
                    downloadItem.state
                  )}`}
                >
                  {downloadItem.state.replace("_", " ")}
                </span>
                {downloadItem.mime_type && (
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-[10px]">
                    {downloadItem.mime_type}
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
                onClick={() => window.open(downloadItem.url, "_blank")}
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

export default DownloadItemComponent;
