import { getBackupMedia } from "@/features/backup/api/backup.api";
import { downloadMedias } from "@/features/backup/utils/backup.utils";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Download, X, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import SamsungSectionLayout from "../../../../../shared/components/SamsungSectionLayout";
import FileGrid from "../components/FileGrid";
import FileGridSkeleton from "../components/FileGridSkeleton";
import FilePreview from "../components/FilePreview";
import Pagination from "../components/Pagination";
import {
  MY_FILES_CATEGORY_FILTERS,
  MY_FILES_SORT_OPTIONS,
} from "../constants/myFiles.constants";
import {
  useMyFiles,
  useMyFilesActions,
  useMyFilesSelection,
} from "../hooks/myFiles.hooks";
import { useMyFilesStore } from "../store/myFiles.store";
import MobileSearchAndFilterHeader from "@/shared/components/MobileSearchAndFilterHeader";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";
import XiaomiSectionLayout from "@/shared/components/XiaomiSectionLayout";

import { useBackupDetails } from "../../../hooks/backup.hooks";
import BackupNotFound from "@/features/backup/components/BackupNotFound";

const MyFilesPage: React.FC = () => {
  const navigate = useNavigate();
  const { backupId } = useParams<{ backupId: string }>();
  useDocumentTitle("My Files | Keepita");
  const numericBackupId = backupId ? parseInt(backupId, 10) : 0;
  const { theme } = useBackupTheme();

  const {
    backup,
    isLoading: isBackupLoading,
    error: backupError,
  } = useBackupDetails(backupId);

  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  const {
    files,
    totalResults,
    totalPages,
    hasNext,
    hasPrevious,
    isLoading,
    isError,
    error,
  } = useMyFiles(numericBackupId);

  const {
    searchQuery,
    selectedCategory,
    selectedFiles,
    filters,
    sortConfig,
    reset,
  } = useMyFilesStore();

  const {
    handleSearch,
    handleCategoryFilter,
    handleSortChange,
    handleClearFilters,
  } = useMyFilesActions();

  const { clearSelection } = useMyFilesSelection();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleBack = () => {
    navigate(`/backups/${backupId}`);
  };

  const sortOptions = MY_FILES_SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    field: option.value.startsWith("-") ? option.value.slice(1) : option.value,
    direction: option.value.startsWith("-")
      ? ("desc" as const)
      : ("asc" as const),
  }));

  const currentSortConfig = {
    field:
      sortConfig.field === "date"
        ? "created_date"
        : sortConfig.field === "name"
          ? "file_name"
          : sortConfig.field === "size"
            ? "file_size"
            : sortConfig.field === "type"
              ? "file_extension"
              : "created_date",
    direction: sortConfig.order,
  };

  const handleSamsungSortChange = (config: {
    field: string;
    direction: "asc" | "desc";
  }) => {
    const fieldMap: Record<string, any> = {
      created_date: "date",
      file_name: "name",
      file_size: "size",
      file_extension: "type",
    };

    const mappedField = fieldMap[config.field] || "date";
    handleSortChange(mappedField, config.direction);
  };

  const handleBulkDownload = async () => {
    if (isBulkDownloading) return;

    setIsBulkDownloading(true);
    try {
      const getRequestSignature = selectedFiles.map(async (fileId) => {
        const { download_url } = await getBackupMedia(fileId);

        const fileNameWithBackupName = download_url
          .split("/files/")[1]
          .split("?")[0];
        const fileName =
          fileNameWithBackupName.split("_")[
            fileNameWithBackupName.split("_").length - 1
          ];

        try {
          return await axios
            .get<Blob>(download_url, { responseType: "blob" })
            .then((res) => ({
              blob: res.data,
              fileName,
            }));
        } catch {
          toast.error("Files are corrupted or an unknown error accured!");

          return;
        }
      });

      const blobFiles = await Promise.all(getRequestSignature);

      const parsedBlobs = blobFiles
        .filter((file) => file?.blob && file?.fileName)
        .map((file) => ({
          blob: file?.blob as Blob,
          name: file?.fileName as string,
        }));

      await downloadMedias(parsedBlobs);
    } catch (error) {
      console.error("Bulk download failed", error);
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory ||
    Object.keys(filters).some((key) => filters[key as keyof typeof filters]),
  );

  const filesTheme = {
    Samsung: {
      layout: SamsungSectionLayout,
      theme: "Samsung" as "Samsung" | "Xiaomi",
      searchPlaceholder: "Search files...",
      containerClassNames: "bg-white min-h-screen",
      filterOptionBorderRadius: "rounded-full",
    },
    Xiaomi: {
      layout: XiaomiSectionLayout,
      theme: "Xiaomi" as "Samsung" | "Xiaomi",
      searchPlaceholder: "Search files",
      containerClassNames: "bg-gray-50 min-h-screen",
      filterOptionBorderRadius: "rounded-lg",
    },
  };
  const currentTheme = filesTheme[theme as "Samsung" | "Xiaomi"];

  const customFilterElements = (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {MY_FILES_CATEGORY_FILTERS.map((category) => {
          const isActive = selectedCategory === category.key;
          const IconComponent = category.icon;

          return (
            <motion.button
              key={category.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                handleCategoryFilter(isActive ? null : category.key)
              }
              className={`
                flex items-center gap-2 px-3 py-2 ${
                  currentTheme.filterOptionBorderRadius
                } text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              <IconComponent className="w-4 h-4" />
              <span>{category.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  if (!backupId || backupError || (!isBackupLoading && !backup)) {
    return <BackupNotFound />;
  }

  if (isError) {
    return (
      <currentTheme.layout
        title="My Files"
        subtitle="Error loading files"
        onBack={handleBack}
        isLoading={false}
        bgColor="bg-gray-50"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Files
            </h2>
            <p className="text-gray-600 mb-4">
              {error?.message || "Failed to load files. Please try again."}
            </p>
          </div>
        </div>
      </currentTheme.layout>
    );
  }

  return (
    <currentTheme.layout
      title="My Files"
      subtitle={`${totalResults} files`}
      onBack={handleBack}
      isLoading={false}
      bgColor="bg-gray-50"
    >
      <div className={currentTheme.containerClassNames}>
        <MobileSearchAndFilterHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          searchPlaceholder={currentTheme.searchPlaceholder}
          customFilterElements={customFilterElements}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          sortConfig={currentSortConfig}
          onSortChange={handleSamsungSortChange}
          sortOptions={sortOptions}
          resultsCount={totalResults}
          resultsLabel="files"
          theme={currentTheme.theme}
          classOverrides={
            theme === "Xiaomi"
              ? {
                  containerClass:
                    "bg-gray-50 rounded-2xl w-full mx-auto pt-2 pb-2 mb-2  ",
                  inputClass:
                    "w-full pl-13 pr-10 py-3 border text-stone-900 font-semibold border-gray-200 rounded-xl text-sm sm:text-md bg-gray-100  focus:border-gray-200 focus:outline-none transition-all duration-200",
                  sortButtonClass:
                    "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-gray-100 text-stone-700 hover:bg-gray-200 border border-gray-200 ",
                  filterContainerClass: "px-4",
                }
              : {}
          }
        />

        <div className="px-4 pb-4">
          {isLoading ? (
            <FileGridSkeleton count={12} />
          ) : (
            <FileGrid files={files} theme={currentTheme.theme} />
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-4 pb-4">
            <Pagination
              totalResults={totalResults}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
            />
          </div>
        )}

        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 z-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedFiles.length} file
                  {selectedFiles.length !== 1 ? "s" : ""} selected
                </p>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBulkDownload}
                    disabled={isBulkDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isBulkDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Download
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearSelection}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FilePreview theme={currentTheme.theme} />
      </div>
    </currentTheme.layout>
  );
};

export default MyFilesPage;
