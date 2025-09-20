import { getBackupMedia } from "@/features/backup/api/backup.api";
import { downloadMedias } from "@/features/backup/utils/backup.utils";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Download, X } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import SamsungSearchAndFilterHeader from "../../../../../shared/components/SamsungSearchAndFilterHeader";
import SamsungSectionLayout from "../../../../../shared/components/SamsungSectionLayout";
import FileGrid from "../components/FileGrid";
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

const MyFilesPage: React.FC = () => {
  const navigate = useNavigate();
  const { backupId } = useParams<{ backupId: string }>();
  useDocumentTitle("My Files | xplorta");
  const numericBackupId = backupId ? parseInt(backupId, 10) : 0;

  // Get server state from React Query (proper pattern)
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

  // Get client state from Zustand
  const {
    searchQuery,
    selectedCategory,
    selectedFiles,
    filters,
    sortConfig,
    reset,
  } = useMyFilesStore();

  // Get actions
  const {
    handleSearch,
    handleCategoryFilter,
    handleSortChange,
    handleClearFilters,
  } = useMyFilesActions();

  // Get selection state and actions
  const { clearSelection } = useMyFilesSelection();

  useEffect(() => {
    // Clean up state when component unmounts
    return () => {
      reset();
    };
  }, [reset]);

  const handleBack = () => {
    navigate(`/backups/${backupId}`);
  };

  // Transform sort options for Samsung component
  const sortOptions = MY_FILES_SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    field: option.value.startsWith("-") ? option.value.slice(1) : option.value,
    direction: option.value.startsWith("-")
      ? ("desc" as const)
      : ("asc" as const),
  }));

  // Current sort config for Samsung component
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

  // Handle sort change from Samsung component
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

    downloadMedias(parsedBlobs);
  };

  // Check if filters are active
  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedCategory ||
      Object.keys(filters).some((key) => filters[key as keyof typeof filters])
  );

  // Custom filter elements for category selection
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
                flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all
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

  if (!backupId || isNaN(numericBackupId)) {
    return (
      <SamsungSectionLayout
        title="My Files"
        subtitle="Invalid backup ID"
        onBack={handleBack}
        isLoading={false}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invalid Backup ID
            </h2>
            <p className="text-gray-600">Please provide a valid backup ID.</p>
          </div>
        </div>
      </SamsungSectionLayout>
    );
  }

  if (isError) {
    return (
      <SamsungSectionLayout
        title="My Files"
        subtitle="Error loading files"
        onBack={handleBack}
        isLoading={false}
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
      </SamsungSectionLayout>
    );
  }

  return (
    <SamsungSectionLayout
      title="My Files"
      subtitle={`${totalResults} files`}
      onBack={handleBack}
      isLoading={isLoading}
    >
      <div className="bg-white min-h-screen">
        {/* Samsung Search and Filter Header */}
        <SamsungSearchAndFilterHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          searchPlaceholder="Search files..."
          customFilterElements={customFilterElements}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          sortConfig={currentSortConfig}
          onSortChange={handleSamsungSortChange}
          sortOptions={sortOptions}
          resultsCount={totalResults}
          resultsLabel="files"
        />

        {/* File Grid */}
        <div className="px-4 pb-4">
          <FileGrid files={files} />
        </div>

        {/* Pagination */}
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

        {/* Selection Actions */}
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
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
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

        {/* File Preview Modal */}
        <FilePreview />
      </div>
    </SamsungSectionLayout>
  );
};

export default MyFilesPage;
