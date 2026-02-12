import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFilePreview } from "../hooks/myFiles.hooks";
import { formatFileDate } from "../utils/myFiles.utils";
import {
  Download,
  X,
  AlertCircle,
  FileText,
  Loader2,
  Play,
  Volume2,
  Maximize,
  SkipBack,
  SkipForward,
  Files,
} from "lucide-react";
import { getBackupMedia } from "@/features/backup/api/backup.api";
import { downloadMedias } from "@/features/backup/utils/backup.utils";

interface FilePreviewProps {
  onDownload?: (fileId: number) => void;
  theme?: "Samsung" | "Xiaomi";
}

const FilePreview: React.FC<FilePreviewProps> = ({
  onDownload,
  theme = "Samsung",
}) => {
  const {
    previewData,
    closePreview,
    getPreviewType,
    handleImageLoad,
    handleImageError,
    isImageLoading,
    imageError,
  } = useFilePreview();

  const [textContent, setTextContent] = useState<string>("");
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const file = previewData?.file;
  const isOpen = previewData?.isPreviewOpen || false;

  useEffect(() => {
    if (file && getPreviewType(file) === "text") {
      loadTextContent();
    } else {
      setTextContent("");
    }
  }, [file]);

  const loadTextContent = async () => {
    if (!file) return;

    setIsLoadingText(true);
    try {
      const response = await fetch(file.file);
      const text = await response.text();
      setTextContent(text);
    } catch {
      setTextContent("Failed to load file content");
    } finally {
      setIsLoadingText(false);
    }
  };

  const handleDownload = async () => {
    if (!file || isDownloading) return;

    setIsDownloading(true);
    try {
      onDownload?.(file.id);

      const { download_url } = await getBackupMedia(file.id);

      await downloadMedias([{ blob: download_url, name: file.file_name }]);
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !file) return null;

  const previewType = getPreviewType(file);

  const renderPreviewContent = () => {
    switch (previewType) {
      case "image":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence>
              {isImageLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center p-10"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">Loading...</span>
                </motion.div>
              )}
            </AnimatePresence>
            {imageError ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-10 text-red-500"
              >
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>{imageError}</p>
              </motion.div>
            ) : (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={file.file}
                alt={file.file_name}
                className="max-w-full max-h-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </div>
        );

      case "video":
        return (
          <div className="relative w-full h-full flex items-center justify-center p-12">
            <AnimatePresence>
              {isVideoLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-10 p-8"
                >
                  <div
                    className="relative w-full max-w-5xl bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
                    style={{ aspectRatio: "16/10", minHeight: "500px" }}
                  >
                    <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.6, 0.9, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20"
                      >
                        <Play className="w-12 h-12 text-white/70 ml-1" />
                      </motion.div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                      <div className="mb-4">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            animate={{ width: ["0%", "40%", "0%"] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <motion.div
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                          >
                            <Play className="w-5 h-5 text-white/70" />
                          </motion.div>

                          <motion.div
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.2,
                            }}
                            className="w-8 h-8 bg-white/20 rounded flex items-center justify-center"
                          >
                            <SkipBack className="w-4 h-4 text-white/70" />
                          </motion.div>

                          <motion.div
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.4,
                            }}
                            className="w-8 h-8 bg-white/20 rounded flex items-center justify-center"
                          >
                            <SkipForward className="w-4 h-4 text-white/70" />
                          </motion.div>

                          <div className="flex items-center space-x-3">
                            <motion.div
                              animate={{ opacity: [0.4, 0.8, 0.4] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: 0.6,
                              }}
                              className="w-8 h-8 bg-white/20 rounded flex items-center justify-center"
                            >
                              <Volume2 className="w-4 h-4 text-white/70" />
                            </motion.div>
                            <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                              <motion.div
                                animate={{ width: ["60%", "80%", "60%"] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-full bg-white/50 rounded-full"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <motion.div
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.8,
                            }}
                            className="flex space-x-1"
                          >
                            <div className="w-8 h-4 bg-white/20 rounded"></div>
                            <div className="w-2 h-4 bg-white/20 rounded"></div>
                            <div className="w-8 h-4 bg-white/20 rounded"></div>
                          </motion.div>

                          <motion.div
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 1,
                            }}
                            className="w-8 h-8 bg-white/20 rounded flex items-center justify-center"
                          >
                            <Maximize className="w-4 h-4 text-white/70" />
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute top-6 left-6 flex items-center space-x-3 bg-black/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10"
                    >
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span className="text-white font-medium">
                        Loading video...
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.video
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isVideoLoading ? 0 : 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={file.file}
              controls
              className="w-full max-w-5xl rounded-xl shadow-2xl"
              style={{ aspectRatio: "16/10", minHeight: "500px" }}
              preload="metadata"
              onLoadStart={() => setIsVideoLoading(true)}
              onLoadedData={() => setIsVideoLoading(false)}
              onError={() => {
                setIsVideoLoading(false);
                setVideoError("Failed to load video");
              }}
            >
              Your browser does not support the video tag.
            </motion.video>

            {videoError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl"
              >
                <div className="text-center p-6 bg-white rounded-xl shadow-xl">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <p className="text-red-500 text-lg font-medium">
                    {videoError}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        );

      case "audio":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl"
            >
              <svg
                className="w-16 h-16 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </motion.div>
            <div className="w-full max-w-md">
              <motion.audio
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                src={file.file}
                controls
                className="w-full mb-4"
                preload="metadata"
              >
                Your browser does not support the audio tag.
              </motion.audio>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {file.file_name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {file.file_extension.toUpperCase()} • {file.file_size_human}
                </p>
              </div>
            </div>
          </motion.div>
        );

      case "text":
        return (
          <div className="w-full h-full overflow-auto">
            {isLoadingText ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center p-10"
              >
                <Loader2 className="w-6 h-6 animate-spin text-gray-500 mr-2" />
                <span className="text-gray-500">Loading...</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5"
              >
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Text Preview
                  </h4>
                </div>
                <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                  <pre className="font-mono text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-words p-4 overflow-auto">
                    {textContent}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        );

      case "pdf":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-10 text-gray-600"
          >
            <FileText className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-gray-800 text-lg font-semibold mb-2">
              PDF Document
            </h3>
            <p className="mb-6 text-gray-600">
              Click to open the PDF in a new tab for better viewing experience.
            </p>
            <div className="flex gap-3 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={file.file}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Open PDF
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download
              </motion.button>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-10 text-gray-600"
          >
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-gray-800 text-lg font-semibold mb-2">
              Preview not available
            </h3>
            <p className="mb-6">
              This file type cannot be previewed in the browser.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download File
            </motion.button>
          </motion.div>
        );
    }
  };
  const filePreviewTheme = {
    Samsung: {
      headerIcon: null,
      headerWrapperClassNames: "flex-1 min-w-0",
    },
    Xiaomi: {
      headerIcon: (
        <div className="size-9 bg-slate-500 rounded-xs flex items-center justify-center">
          <Files className="size-5 text-white" />
        </div>
      ),
      headerWrapperClassNames: "flex-1 min-w-0 ",
    },
  };
  const currentTheme = filePreviewTheme[theme];
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal modal-open">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop bg-black/20 backdrop-blur-md"
            onClick={closePreview}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="modal-box w-11/12 max-w-4xl h-[80vh] min-h-[400px] max-h-[90vh] p-0 flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0"
            >
              <div className={currentTheme.headerWrapperClassNames}>
                {currentTheme.headerIcon ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 truncate">
                    {currentTheme.headerIcon}
                    <h3 className="text-[16px] sm:text-lg font-semibold text-gray-800 truncate">
                      {file.file_name}
                    </h3>
                  </div>
                ) : (
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {file.file_name}
                  </h3>
                )}

                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{file.file_size_human}</span>
                  <span className="text-gray-400">•</span>
                  <span>{file.file_extension.toUpperCase()}</span>
                  <span className="text-gray-400">•</span>
                  <span>{formatFileDate(file.modified_date)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownload()}
                  disabled={isDownloading}
                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Download"
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closePreview}
                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 overflow-hidden bg-white"
            >
              <div className="h-full w-full overflow-auto">
                {renderPreviewContent()}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-between items-center px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0"
            >
              <div className="flex gap-4 text-xs text-gray-600">
                <span>Category: {file.category.toUpperCase()}</span>
                <span>MIME: {file.mime_type}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FilePreview;
