import { AnimatePresence, motion } from "framer-motion";
import { Archive, Info, Plus } from "lucide-react";

import { useBackupStore } from "../store/backup.store";
import ProcessingIndicator from "../components/ProcessingIndicator";
import BackupStats from "../components/BackupStats";
import CreateBackupForm from "../components/CreateBackupForm";
import {
  useBackupFilters,
  useBackupManager,
  useDeleteBackup,
} from "../hooks/backup.hooks";
import { usePagination } from "../../../core/hooks/usePagination";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import SearchAndFilterBar from "../components/SearchAndFilterBar";
import ActiveFiltersBar from "../components/ActiveFiltersBar";
import BackupPage from "./BackupPage";
import { useBackupsStats } from "../services/backup.services";

const BackupLayout = () => {
  useDocumentTitle("Backups | xplorta");

  const setShowCreateForm = useBackupStore((state) => state.setShowCreateForm);

  const { data: stats } = useBackupsStats();

  // Initialize pagination hook
  const pagination = usePagination(1, 6);

  // Filter and search state
  const {
    filters,
    searchQuery,
    sortConfig,
    showCreateForm,
    deletingId,
    clearAllFilters,
    handleCreateSuccess,
    handleDelete,
    handleFilterChange,
    handleRemoveDateRange,
    handleRemoveFilter,
    handleSearch,
    handleSortChange,
  } = useBackupFilters(pagination);

  // Fetch data with the constructed parameters
  const {
    backups,
    pagination: apiPagination,
    isLoading,
  } = useBackupManager({ pagination });

  const { isLoading: isDeleting } = useDeleteBackup();

  return (
    <div className="min-h-screen relative flex flex-col items-start">
      <div className="w-full z-10">
        <ProcessingIndicator
          isProcessing={isLoading}
          text={`Updating results...`}
        />
        <BackupStats stats={stats} />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-10"
        >
          <motion.div
            className="mb-4 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="flex items-center">
              <motion.div
                whileHover={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: 1.1,
                  transition: { duration: 0.5 },
                }}
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-indigo-600/30 blur-lg rounded-full"></div>
                  <Archive className="w-10 h-10 mr-4 text-indigo-400 relative" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ backgroundPositionX: "200%" }}
                animate={{
                  backgroundPositionX: ["200%", "0%", "100%", "0%"],
                  transition: {
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "loop",
                  },
                }}
                className="text-4xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent bg-[size:400%]"
              >
                Backups
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-gray-300 mt-1 ml-14 font-medium"
            >
              Secure and manage your data backups
            </motion.p>
          </motion.div>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 15px rgba(79, 70, 229, 0.5)",
              background: showCreateForm
                ? "linear-gradient(to right, #6366f1, #4f46e5)" // from-indigo-500 to-indigo-600
                : "linear-gradient(to right, #4f46e5, #4338ca)", // from-indigo-600 to-indigo-700
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-5 rounded-xl shadow-lg shadow-indigo-700/30 font-medium"
          >
            {showCreateForm ? (
              <>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Info className="w-5 h-5 mr-3" />
                </motion.div>
                Back to Backups
              </>
            ) : (
              <>
                <motion.div
                  transition={{
                    duration: 0.4,
                    delay: 1,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                >
                  <Plus className="w-5 h-5 mr-3" />
                </motion.div>
                Create New Backup
              </>
            )}
          </motion.button>
        </motion.div>
        {showCreateForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <CreateBackupForm onSuccess={handleCreateSuccess} />
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="backup-list-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SearchAndFilterBar
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                activeSort={sortConfig}
              />
            </motion.div>
            <AnimatePresence>
              <ActiveFiltersBar
                searchQuery={searchQuery}
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={clearAllFilters}
                onRemoveDateRange={handleRemoveDateRange}
              />
            </AnimatePresence>
            {/* body */}
            <BackupPage
              backups={backups}
              isBackupsLoading={isLoading}
              deletingId={deletingId}
              handleDelete={handleDelete}
              isDeleting={isDeleting}
              pagination={pagination}
              apiPagination={apiPagination}
            />
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default BackupLayout;
