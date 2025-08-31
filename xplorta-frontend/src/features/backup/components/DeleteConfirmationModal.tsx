import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";
import Modal from "../../../shared/components/Modal";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  backupName: string;
  isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  backupName,
  isLoading,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setShowSuccess(true);

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      console.error("Delete operation failed:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title="Delete Backup"
      size="sm"
    >
      <div className="flex flex-col">
        {" "}
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              className="flex flex-col items-center justify-center py-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-emerald-500/20 p-4 rounded-full mb-4"
                initial={{ scale: 0.8 }}
                animate={{
                  scale: [0.8, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </motion.div>
              <motion.p
                className="text-lg font-medium text-emerald-400 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Backup deleted successfully!
              </motion.p>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="flex items-center mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.div
                  className="bg-red-500/20 p-2 rounded-lg mr-3"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.1, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -10, 10, -5, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </motion.div>
                </motion.div>
                <motion.p
                  className="text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  Are you sure you want to delete this backup?
                </motion.p>
              </motion.div>{" "}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <motion.p
                    className="font-medium text-white bg-gray-700/50 px-3 py-2 rounded border border-gray-600/30"
                    whileHover={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      borderColor: "rgba(239, 68, 68, 0.3)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {backupName}
                  </motion.p>
                </motion.div>
                <motion.p
                  className="text-red-300 text-sm mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  This action cannot be undone. The backup will be permanently
                  deleted.
                </motion.p>
              </motion.div>
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >
                <motion.button
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  whileHover={{
                    scale: 1.03,
                    backgroundColor: "rgba(75, 85, 99, 0.7)",
                    transition: { type: "spring", stiffness: 400, damping: 10 },
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2 px-4 bg-gray-700/80 backdrop-blur-sm text-gray-100 rounded-lg transition-all border border-gray-600/30 shadow-sm cursor-pointer disabled:cursor-not-allowed relative overflow-hidden group"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  <motion.span className="relative z-10">Cancel</motion.span>
                  <motion.div
                    className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                </motion.button>
                <motion.button
                  initial={{ scale: 0.95 }}
                  animate={{
                    scale: 1,
                    boxShadow: isLoading
                      ? undefined
                      : [
                          "0 0 5px rgba(220, 38, 38, 0.3)",
                          "0 0 10px rgba(220, 38, 38, 0.5)",
                          "0 0 5px rgba(220, 38, 38, 0.3)",
                        ],
                  }}
                  transition={{
                    boxShadow: {
                      repeat: Infinity,
                      duration: 2,
                    },
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 15px rgba(220, 38, 38, 0.6)",
                    transition: { type: "spring", stiffness: 400, damping: 10 },
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all flex justify-center items-center shadow-md shadow-red-700/20 cursor-pointer disabled:cursor-not-allowed relative overflow-hidden"
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {" "}
                  {isLoading ? (
                    <div className="relative flex items-center justify-center">
                      <motion.svg
                        className="h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <motion.path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        ></motion.path>
                      </motion.svg>
                      <motion.div
                        className="absolute inset-0 rounded-full bg-red-500/30 blur-md"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.4, 0.7, 0.4],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut",
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full bg-red-400/20 blur-sm"
                        animate={{
                          scale: [0.8, 1.1, 0.8],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut",
                          delay: 0.25,
                        }}
                      />
                    </div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Delete
                    </motion.span>
                  )}
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
