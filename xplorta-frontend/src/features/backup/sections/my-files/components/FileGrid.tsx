import { AnimatePresence, motion } from "framer-motion";
import { Download, FolderOpen, MoreVertical } from "lucide-react";
import React from "react";
import { getFileIcon } from "../constants/myFiles.constants";
import { useFilePreview } from "../hooks/myFiles.hooks";
import { useMyFilesStore } from "../store/myFiles.store";
import type { MyFile } from "../types/myFiles.types";
import { formatFileDate } from "../utils/myFiles.utils";
import { downloadMedias } from "@/features/backup/utils/backup.utils";
import { getBackupMedia } from "@/features/backup/api/backup.api";

interface FileGridProps {
  files: MyFile[];
  onFileDownload?: (fileId: number) => void;
  isDownloading?: boolean;
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  onFileDownload,
  isDownloading = false,
}) => {
  const { selectedFiles, selectFile, viewMode } = useMyFilesStore();
  const { openPreview, isPreviewable } = useFilePreview();

  const handleFileClick = (file: MyFile) => {
    if (isPreviewable(file)) {
      openPreview(file);
    } else {
      selectFile(file.id);
    }
  };

  const handleFileSelect = (e: React.MouseEvent, fileId: number) => {
    e.stopPropagation();
    selectFile(fileId);
  };

  const handleDownload = async (
    e: React.MouseEvent,
    fileId: number,
    fileName: string
  ) => {
    e.stopPropagation();
    onFileDownload?.(fileId);

    const { download_url } = await getBackupMedia(fileId);

    downloadMedias([{ blob: download_url, name: fileName }]);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      image: "bg-blue-500",
      video: "bg-red-500",
      audio: "bg-green-500",
      document: "bg-orange-500",
      apk: "bg-purple-500",
      zip: "bg-gray-500",
      archive: "bg-purple-500",
      other: "bg-gray-500",
    };
    return colors[category] || colors.other;
  };

  const getFileTypeLabel = (extension: string) => {
    const ext = extension.toLowerCase().replace(".", "");
    const typeMap: Record<string, string> = {
      jpg: "JPG",
      jpeg: "JPEG",
      png: "PNG",
      gif: "GIF",
      webp: "WEBP",
      mp4: "MP4",
      avi: "AVI",
      mov: "MOV",
      mkv: "MKV",
      webm: "WEBM",
      mp3: "MP3",
      wav: "WAV",
      flac: "FLAC",
      aac: "AAC",
      ogg: "OGG",
      pdf: "PDF",
      doc: "DOC",
      docx: "DOCX",
      xls: "XLS",
      xlsx: "XLSX",
      ppt: "PPT",
      pptx: "PPTX",
      txt: "TXT",
      rtf: "RTF",
      zip: "ZIP",
      rar: "RAR",
      "7z": "7Z",
      tar: "TAR",
      gz: "GZ",
      apk: "APK",
    };
    return typeMap[ext] || ext.toUpperCase();
  };

  if (files.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6"
        >
          <FolderOpen className="w-10 h-10 text-gray-400" />
        </motion.div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No files found
        </h3>
        <p className="text-gray-500 text-sm max-w-sm">
          There are no files in this backup matching your current filters.
        </p>
      </motion.div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-600">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Modified</div>
        </div>

        {/* File List */}
        <AnimatePresence>
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group ${
                selectedFiles.includes(file.id) ? "bg-blue-50" : ""
              }`}
              onClick={() => handleFileClick(file)}
            >
              {/* Name Column */}
              <div className="col-span-6 flex items-center gap-3 min-w-0">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleFileSelect(e, file.id)}
                  className="flex-shrink-0"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                      selectedFiles.includes(file.id)
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {selectedFiles.includes(file.id) && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    )}
                  </div>
                </motion.div>

                <div className="text-2xl flex-shrink-0">
                  {React.createElement(
                    getFileIcon(file.file_extension, file.category),
                    {
                      className: "w-6 h-6 text-gray-600",
                    }
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-gray-900 font-medium text-sm truncate"
                    title={file.file_name}
                  >
                    {file.file_name}
                  </p>
                </div>
              </div>

              {/* Size Column */}
              <div className="col-span-2 flex items-center">
                <span className="text-gray-600 text-sm">
                  {file.file_size_human}
                </span>
              </div>

              {/* Type Column */}
              <div className="col-span-2 flex items-center">
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium text-white ${getCategoryColor(
                    file.category
                  )}`}
                >
                  {getFileTypeLabel(file.file_extension)}
                </span>
              </div>

              {/* Modified Column */}
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-gray-500 text-xs">
                  {formatFileDate(file.modified_date)}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleDownload(e, file.id, file.file_name)}
                    disabled={isDownloading}
                    className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    title="More options"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
              delay: index * 0.05,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className={`relative bg-white rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:shadow-lg group ${
              selectedFiles.includes(file.id)
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:shadow-md border border-gray-100"
            }`}
            onClick={() => handleFileClick(file)}
          >
            {/* Selection Checkbox */}
            <motion.div
              className="absolute top-2 left-2 z-10"
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleFileSelect(e, file.id)}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  selectedFiles.includes(file.id)
                    ? "bg-blue-600 border-blue-600 scale-110"
                    : "bg-white border-gray-300 group-hover:border-blue-400 shadow-sm"
                }`}
              >
                {selectedFiles.includes(file.id) && (
                  <motion.svg
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 15 }}
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={async (e) => {
                  handleDownload(e, file.id, file.file_name);
                }}
                disabled={isDownloading}
                className="p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                title="Download"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                title="More options"
              >
                <MoreVertical className="w-3.5 h-3.5 text-gray-600" />
              </motion.button>
            </div>

            {/* File Preview/Icon */}
            <div className="relative w-full aspect-square mb-3 bg-gray-50 rounded-xl overflow-hidden">
              {file.category === "image" ? (
                <>
                  <motion.img
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={file.file}
                    alt={file.file_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                      const fallback = img.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.classList.remove("hidden");
                        fallback.classList.add("flex");
                      }
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-4xl">
                    {React.createElement(
                      getFileIcon(file.file_extension, file.category),
                      {
                        className: "w-12 h-12 text-gray-400",
                      }
                    )}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                  className="w-full h-full flex items-center justify-center text-4xl"
                >
                  {React.createElement(
                    getFileIcon(file.file_extension, file.category),
                    {
                      className: "w-12 h-12 text-gray-400",
                    }
                  )}
                </motion.div>
              )}

              {/* Category Badge */}
              <div
                className={`absolute bottom-2 left-2 px-2 py-1 rounded-md text-xs font-bold text-white ${getCategoryColor(
                  file.category
                )}`}
              >
                {getFileTypeLabel(file.file_extension)}
              </div>
            </div>

            {/* File Info */}
            <div className="space-y-1">
              <h3
                className="font-medium text-gray-900 text-sm truncate"
                title={file.file_name}
              >
                {file.file_name}
              </h3>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{file.file_size_human}</span>
                <span className="text-gray-400">
                  {formatFileDate(file.modified_date)}
                </span>
              </div>
            </div>

            {/* Touch Ripple Effect */}
            <motion.div
              className="absolute inset-0 bg-blue-400 opacity-0 rounded-2xl pointer-events-none"
              initial={false}
              animate={
                selectedFiles.includes(file.id)
                  ? { opacity: [0, 0.1, 0] }
                  : { opacity: 0 }
              }
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FileGrid;
