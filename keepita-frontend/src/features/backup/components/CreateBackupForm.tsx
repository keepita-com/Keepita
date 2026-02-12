import React, { useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  AlertTriangle,
  Save,
  Upload,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { useCreateBackup } from "../hooks/backup.hooks";
import { useBackupProgress } from "../hooks/backup.hooks";
import BackupProgressTracker from "./BackupProgressTracker";
import { useBackupStore } from "../store/backup.store";
import { useBackupToastStore } from "../store/uploadToastStore";

interface CreateBackupFormInputs {
  name: string;
  backup_file: FileList;
  device_brand: string;
  ios_password?: string;
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
    setValue,
  } = useForm<CreateBackupFormInputs>({
    defaultValues: {
      device_brand: "samsung",
    },
  });

  const {
    createBackup,
    backupCreationData,
    isLoading,
    uploadProgress,
    uploadPhase,
    error,
    success,
  } = useCreateBackup();

  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [showProgress, setShowProgress] = useState(false);
  const fileInput = watch("backup_file");

  const backupCreationId = useBackupToastStore(
    (state) => state.backupCreationId,
  );
  const setBackupCreationId = useBackupToastStore(
    (state) => state.setBackupCreationId,
  );

  const { progress, setProgress } = useBackupProgress(
    backupCreationData?.log_id ?? undefined,
  );

  const uploadToastId = useBackupStore((state) => state.uploadToastId);

  React.useEffect(() => {
    return () => {
      if (uploadPhase === "uploading") {
        toast.dismiss(uploadToastId);
      }
    };
  }, []);

  React.useEffect(() => {
    if (success && backupCreationData?.log_id) {
      setShowProgress(true);
      setBackupCreationId(backupCreationData.log_id);
    }
  }, [success, backupCreationData]);

  React.useEffect(() => {
    if (progress && progress.status === "completed") {
      setAnimateSuccess(true);
      setTimeout(() => {
        setAnimateSuccess(false);
        if (onSuccess) onSuccess();

        setProgress(null);
      }, 5000);
    }
  }, [progress, onSuccess]);

  React.useEffect(() => {
    if (fileInput && fileInput.length > 0) {
      setSelectedFileName(fileInput[0].name);
    } else {
      setSelectedFileName("");
    }
  }, [fileInput]);

  const onSubmit = async (data: CreateBackupFormInputs) => {
    if (backupCreationId && !backupCreationData?.log_id) {
      toast.error("You have one upload in progress!", {
        className: "!text-white",
      });
      return;
    }

    if (!data.backup_file || data.backup_file.length === 0) return;
    const file = data.backup_file[0];

    await createBackup({
      name: data.name,
      backup_file: file,
      device_brand: data.device_brand,
      ios_password: data.device_brand === "ios" ? data.ios_password : undefined,
    });
  };

  const handleCloseProgress = () => {
    setShowProgress(false);
    reset();
    setSelectedFileName("");
    if (onSuccess) onSuccess();
  };

  const handleChangeDeviceBrand = (e: MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setValue("device_brand", target.value);
  };

  const isFormDisabled =
    isLoading ||
    uploadPhase === "uploading" ||
    uploadPhase === "processing" ||
    uploadPhase === "completed";

  const brandOptions = [
    { label: "Samsung", value: "samsung" },
    { label: "Xiaomi", value: "xiaomi" },
    { label: "IOS", value: "ios" },
    { label: "Android", value: "android" },
  ];

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
            } rounded-lg px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${
              isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            placeholder="Enter a name for your backup"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="Device-Brand"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Device Brand
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-10 mt-2">
            {brandOptions.map((option) => (
              <div
                key={option.value}
                className={`flex flex-row items-center gap-2.5 ${
                  isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <input
                  type="radio"
                  {...register("device_brand")}
                  className={`radio size-5 ${
                    isFormDisabled ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  checked={option.value === watch("device_brand")}
                  value={option.value}
                  onClick={handleChangeDeviceBrand}
                  disabled={isFormDisabled}
                />
                <span className="block text-sm font-medium text-gray-300">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {watch("device_brand") === "ios" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <label
              htmlFor="ios_password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Backup Password (Optional)
            </label>
            <input
              id="ios_password"
              type="password"
              disabled={isFormDisabled}
              {...register("ios_password")}
              className={`w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${
                isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              placeholder="Enter password if encrypted"
            />
          </motion.div>
        )}
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
              accept=".zip"
              className={`absolute inset-0 opacity-0 w-full h-full z-10 ${
                isFormDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              {...register("backup_file", {
                required: "Please select a file for backup",
                validate: {
                  isZip: (files) => {
                    if (!files || files.length === 0) return true;
                    const file = files[0];
                    return (
                      file.name.toLowerCase().endsWith(".zip") ||
                      "Invalid format. Only zip files are allowed."
                    );
                  },
                },
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
                ) : uploadPhase === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : error ? (
                  <XCircle className="w-5 h-5 text-red-400" />
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
                      : selectedFileName || "Choose a .zip file for backup"}
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

        {(uploadPhase === "uploading" || uploadPhase === "processing") && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            type="button"
            onClick={() => {
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
