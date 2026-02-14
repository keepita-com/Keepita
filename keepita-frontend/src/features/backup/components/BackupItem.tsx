import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Calendar,
  Check,
  Clock,
  FileText,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import type { BackupItem as BackupItemType } from "../store/backup.store";
import { formatFileSize } from "../../../shared/utils/formatting";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useBackupTheme } from "../store/backupThemes.store";

interface BackupItemProps {
  backup: BackupItemType;
  onDelete: (id: string) => void;
  deleteLoading?: boolean;
}

const BackupItem: React.FC<BackupItemProps> = ({
  backup,
  onDelete,
  deleteLoading,
}) => {
  const navigate = useNavigate();
  const formattedDate = new Date(backup.created_at).toLocaleString();
  const formattedSize = formatFileSize(backup.size);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { setBackupTheme } = useBackupTheme();

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsConfirming(true);
    try {
      await onDelete(backup.id.toString());
    } finally {
      setIsConfirming(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewBackup = () => {
    setBackupTheme(
      backup.device_brand === "xiaomi"
        ? "Xiaomi"
        : backup.device_brand === "samsung"
          ? "Samsung"
          : "Apple",
    );
    navigate(`/backups/${backup.id}`);
  };

  const icon = <FileText className="w-4 h-4 text-blue-400" />;
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        whileHover={{
          y: -5,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          transition: { type: "spring", stiffness: 400, damping: 15 },
        }}
        className={`relative bg-gradient-to-br from-gray-800/70 to-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-lg overflow-hidden group ${
          deleteLoading || isConfirming ? "opacity-75 pointer-events-none" : ""
        }`}
      >
        <div className="flex flex-col p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-blue-500/10 p-2 rounded-lg"
              >
                <Archive className="w-6 h-6 text-blue-400 drop-shadow-[0_0_3px_rgba(59,130,246,0.3)]" />
              </motion.div>
              <h3 className="font-semibold text-white text-lg ml-3">
                {backup.name}
              </h3>
            </div>
            <motion.button
              whileHover={{ boxShadow: "0 0 8px rgba(255, 74, 74, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              onClick={handleDeleteClick}
              disabled={deleteLoading}
              className="relative flex items-center justify-center p-2 rounded-full bg-red-600/60 hover:bg-red-600/80 text-white shadow-sm transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Delete backup"
            >
              {deleteLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear",
                  }}
                  className="relative h-4 w-4 flex items-center justify-center"
                >
                  <svg
                    className="h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md animate-pulse"></div>
                </motion.div>
              ) : (
                <motion.div
                  className="group/trash relative"
                  initial={{ opacity: 1 }}
                  whileHover={{
                    scale: 1.2,
                    color: "#ff4a4a",
                    filter: "drop-shadow(0 0 4px rgba(255, 74, 74, 0.5))",
                  }}
                  animate={{
                    y: 0,
                    rotate: deleteLoading ? [0, 360] : 0,
                    transition: deleteLoading
                      ? {
                          rotate: {
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "linear",
                          },
                        }
                      : {},
                  }}
                  whileTap={{ scale: 0.8, rotate: -15 }}
                >
                  <motion.div
                    whileHover={{
                      rotate: [0, -15, 15, -8, 0],
                      transition: {
                        duration: 0.6,
                        ease: "easeInOut",
                        times: [0, 0.2, 0.5, 0.8, 1],
                        repeat: 1,
                        repeatDelay: 0.2,
                      },
                    }}
                    className="relative"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 bg-red-500/30 rounded-full blur-xl opacity-0 group-hover/trash:opacity-100 transition-opacity duration-200 pointer-events-none"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  />
                </motion.div>
              )}
            </motion.button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <motion.div
              className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center tooltip tooltip-bottom"
              data-tip={backup.model_name || "No Model"}
              whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-blue-500/10 p-1 rounded mr-2">{icon}</div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Model</div>
                <div className="text-sm text-white truncate max-w-[90px]">
                  {backup.model_name && backup.model_name.trim() !== ""
                    ? backup.model_name
                    : "No Model"}
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center"
              whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-blue-500/10 p-1 rounded mr-2">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Created</div>
                <div
                  className="text-sm text-white truncate max-w-[90px]"
                  title={formattedDate}
                >
                  {new Date(backup.created_at).toLocaleDateString()}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center col-span-1"
              whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-blue-500/10 p-1 rounded mr-2">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Size</div>
                <div className="text-sm text-white">{formattedSize}</div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center col-span-1"
              whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-blue-500/10 p-1 rounded mr-2">
                {backup.status === "completed" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : backup.status === "failed" ? (
                  <X className="w-4 h-4 text-red-400" />
                ) : backup.status === "processing" ? (
                  <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Status</div>
                <div className="text-sm text-white">{backup.status}</div>
              </div>
            </motion.div>
          </div>

          <div className="mt-4">
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={handleViewBackup}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 group shadow-lg"
            >
              <Archive className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>View Backup</span>
              <motion.div
                className="ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
                whileHover={{ x: 2 }}
              >
                →
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        backupName={backup.name}
        isLoading={isConfirming || Boolean(deleteLoading)}
      />
    </>
  );
};

export default BackupItem;
