import { AnimatePresence, motion } from "framer-motion";
import BackupListSkeleton from "../components/BackupListSkeleton";
import BackupPagination from "../components/BackupPagination";
import EmptyState from "../components/EmptyState";
import type {
  BackupItem as BackupItemT,
  BackupState,
} from "../store/backup.store";
import type { usePagination } from "../../../core/hooks/usePagination";
import type { useBackupFilters, useBackupManager } from "../hooks/backup.hooks";
import BackupItem from "../components/BackupItem";

const BackupPage = ({
  backups,
  isBackupsLoading,
  apiPagination,
  pagination,
  deletingId,
  handleDelete,
  isDeleting,
}: {
  backups: BackupItemT[];
  isBackupsLoading: boolean;
  pagination: ReturnType<typeof usePagination>;
  apiPagination: ReturnType<typeof useBackupManager>["pagination"];
  handleDelete: ReturnType<typeof useBackupFilters>["handleDelete"];
  isDeleting: boolean;
  deletingId: BackupState["deletingId"];
}) => {
  return (
    <>
      {Array.isArray(backups) && backups.length > 0 && (
        <>
          <motion.div
            className="mb-6 flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.p
              key={`results-${apiPagination?.totalResults || 0}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-gray-400"
            >
              {!apiPagination?.totalResults
                ? "No backups found"
                : apiPagination.totalResults === 1
                ? "Showing 1 backup"
                : (() => {
                    const range = pagination.getVisibleRange(
                      pagination.page,
                      pagination.pageSize,
                      apiPagination.totalResults
                    );
                    return (
                      <>
                        Showing{" "}
                        <span className="text-white font-medium">
                          {range.start}-{range.end}
                        </span>{" "}
                        of{" "}
                        <span className="text-white font-medium">
                          {apiPagination.totalResults}
                        </span>{" "}
                        backups
                      </>
                    );
                  })()}
            </motion.p>
          </motion.div>
        </>
      )}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {isBackupsLoading ? (
          <BackupListSkeleton count={6} />
        ) : Array.isArray(backups) && backups.length > 0 ? (
          <>
            <AnimatePresence>
              {backups.map((backup, index) => (
                <motion.div
                  key={backup.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    y: -20,
                    transition: { duration: 0.25, ease: "easeOut" },
                  }}
                  transition={{
                    duration: 0.3,
                    delay: 0.05 * (index % 3),
                  }}
                >
                  <BackupItem
                    backup={backup}
                    onDelete={handleDelete}
                    deleteLoading={isDeleting && deletingId === backup.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {/* pagination */}
            {apiPagination && apiPagination.totalPages > 1 && (
              <motion.div
                className="col-span-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <BackupPagination
                  currentPage={pagination.page}
                  totalPages={apiPagination.totalPages}
                  onPageChange={pagination.handlePageChange}
                  onPrevPage={pagination.prevPage}
                  onNextPage={pagination.nextPage}
                  hasNextPage={apiPagination.hasNext}
                  hasPrevPage={apiPagination.hasPrevious}
                  isLoading={isBackupsLoading}
                />
              </motion.div>
            )}
          </>
        ) : (
          <EmptyState
            icon="no-backups"
            title="No Backups Found"
            description="Create your first backup to ensure your data is safe and easily recoverable when needed."
          />
        )}
      </motion.div>
    </>
  );
};

export default BackupPage;
