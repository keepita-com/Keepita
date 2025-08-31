import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { AlertTriangle, Save, Upload } from "lucide-react";
import toast from "react-hot-toast";

import { useCreateBackup, useBackupProgress } from "../hooks/backup.hooks";

import BackupProgressTracker from "./BackupProgressTracker";
import { useBackupStore } from "../store/backup.store";
import { useBackupToastStore } from "../store/uploadToastStore";

interface CreateBackupFormInputs {
  name: string;
  backup_file: FileList;
}

interface CreateBackupFormProps {
  onSuccess?: () => void;
}

const CreateBackupForm: React.FC<CreateBackupFormProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateBackupFormInputs>();

  const {
    createBackup,
    backupCreationData,
    isLoading,
    uploadProgress,
    uploadPhase,
    error,
  } = useCreateBackup();
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [showProgress, setShowProgress] = useState(false);
  const fileInput = watch("backup_file");

  const backupCreationId = useBackupToastStore(
    (state) => state.backupCreationId
  );
  const setBackupCreationId = useBackupToastStore(
    (state) => state.setBackupCreationId
  );

  const [canSubmit, setCanSubmit] = useState(true);

  const {
    progress,
    setProgress,
    refetch: refetchProgress,
  } = useBackupProgress(backupCreationData?.log_id);

  const uploadToastId = useBackupStore((state) => state.uploadToastId);

  useEffect(() => {
    return () => {
      console.log(uploadPhase);
      if (uploadPhase === "uploading") {
        toast.dismiss(uploadToastId);
      }
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (backupCreationData?.log_id) {
      setShowProgress(true);
    }

    setBackupCreationId(backupCreationData?.log_id);
  }, [backupCreationData]); // eslint-disable-line

  useEffect(() => {
    if (progress && progress.status === "completed") {
      setAnimateSuccess(true);
      setTimeout(() => {
        setAnimateSuccess(false);
        onSuccess?.();
        setProgress(null);
      }, 5000);
    }
  }, [progress, onSuccess]); // eslint-disable-line

  useEffect(() => {
    if (fileInput && fileInput.length > 0) {
      setSelectedFileName(fileInput[0].name);
    }
  }, [fileInput]);

  // handling: user should not be able to upload multiple backups
  useEffect(() => {
    if (backupCreationId && !backupCreationData?.log_id) {
      setCanSubmit(false);
    }
  }, [backupCreationId]); // eslint-disable-line

  const onSubmit = async (data: CreateBackupFormInputs) => {
    if (!canSubmit) {
      toast.error("You have one upload in progress!", {
        className: "!text-white",
      });

      return;
    }
    if (!data.backup_file || data.backup_file.length === 0) return;

    const params = {
      name: data.name,
      backup_file: data.backup_file[0],
    };

    const response = await createBackup(params);

    if (response) {
      setShowProgress(true);
      refetchProgress();
    }
  };

  const handleCloseProgress = () => {
    setShowProgress(false);
    reset();
    setSelectedFileName("");
    if (onSuccess) onSuccess();
  };

  // Check if form should be disabled (during upload/processing)
  const isFormDisabled =
    isLoading || uploadPhase === "uploading" || uploadPhase === "processing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 shadow-xl p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-4">
        Create New Backup
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg mb-4 flex items-center"
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Backup Name
          </label>
          <input
            id="name"
            type="text"
            disabled={isFormDisabled}
            {...register("name")}
            className={`w-full bg-gray-900/60 border ${
              errors.name ? "border-red-500/50" : "border-gray-700"
            } rounded-lg px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            placeholder="My Backup"
          />
          {errors.name && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-sm text-red-400"
            >
              {errors.name.message}
            </motion.p>
          )}
        </div>
        <div className="mb-6">
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Backup File
          </label>
          <div
            className={`relative w-full bg-gray-900/60 border ${
              errors.backup_file ? "border-red-500/50" : "border-gray-700"
            } rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 ${
              isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <input
              id="file"
              type="file"
              disabled={isFormDisabled}
              className={`absolute inset-0 opacity-0 w-full h-full z-10 ${
                isFormDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              {...register("backup_file", {
                required: "Please select a file for backup",
              })}
            />
            <div className="flex items-center p-3">
              <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                {uploadPhase === "uploading" ? (
                  <svg
                    className="animate-spin h-5 w-5 text-blue-400"
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
                ) : (
                  <Upload className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm text-gray-300">
                  {uploadPhase === "uploading"
                    ? `Uploading ${selectedFileName}...`
                    : uploadPhase === "processing"
                    ? `Processing ${selectedFileName}...`
                    : selectedFileName || "Choose a file for backup"}
                </p>
                {uploadPhase === "uploading" && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <motion.div
                        className="bg-blue-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-2">
                {uploadPhase === "uploading" ? (
                  <span className="text-xs px-2 py-1 bg-blue-500/20 rounded-lg text-blue-300 font-mono">
                    {uploadProgress.toFixed(1)}%
                  </span>
                ) : uploadPhase === "processing" ? (
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 rounded-lg text-yellow-300">
                    Processing
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-blue-500/20 rounded-lg text-blue-300">
                    Browse
                  </span>
                )}
              </div>
            </div>
          </div>
          {errors.backup_file && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-sm text-red-400"
            >
              {errors?.backup_file.message}
            </motion.p>
          )}
        </div>
        {/* Show Create button only when not uploading/processing/showing progress */}
        {uploadPhase !== "uploading" &&
          uploadPhase !== "processing" &&
          !showProgress && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={
                animateSuccess
                  ? {
                      backgroundColor: [
                        "rgb(37, 99, 235)",
                        "rgb(34, 197, 94)",
                        "rgb(37, 99, 235)",
                      ],
                      transition: { duration: 1.5, repeat: 0 },
                    }
                  : {}
              }
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-2 px-4 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
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
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Backup
                </>
              )}
            </motion.button>
          )}
        {/* Cancel button during upload/processing */}
        {(uploadPhase === "uploading" || uploadPhase === "processing") && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            type="button"
            onClick={() => {
              // Reset form state
              reset();
              setSelectedFileName("");
              setShowProgress(false);
            }}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </motion.button>
        )}
      </form>

      <BackupProgressTracker
        progress={progress}
        isOpen={showProgress}
        onClose={handleCloseProgress}
      />
    </motion.div>
  );
};

export default CreateBackupForm;
