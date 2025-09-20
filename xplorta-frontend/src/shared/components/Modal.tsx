import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: -30,
      scale: 0.95,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
        duration: 0.4,
        delayChildren: 0.2,
        staggerChildren: 0.08,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.96,
      filter: "blur(4px)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999999] overflow-y-auto">
          <motion.div
            className="fixed inset-0 backdrop-blur-md bg-black/70"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={onClose}
          >
            <motion.div
              className="absolute inset-0 opacity-40"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 20%, rgba(62, 87, 229, 0.4) 0%, rgba(0, 0, 0, 0) 70%)",
                  "radial-gradient(circle at 80% 30%, rgba(120, 62, 229, 0.6) 0%, rgba(0, 0, 0, 0) 70%)",
                  "radial-gradient(circle at 40% 80%, rgba(229, 62, 109, 0.5) 0%, rgba(0, 0, 0, 0) 70%)",
                  "radial-gradient(circle at 70% 70%, rgba(62, 180, 229, 0.4) 0%, rgba(0, 0, 0, 0) 70%)",
                  "radial-gradient(circle at 20% 20%, rgba(62, 87, 229, 0.4) 0%, rgba(0, 0, 0, 0) 70%)",
                ],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>{" "}
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Glow effect wrapper */}
            <div className={`relative ${sizeClasses[size]} w-full`}>
              <motion.div
                className="absolute -inset-0.5  rounded-xl opacity-30 blur-md"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  filter: ["blur(8px)", "blur(10px)", "blur(8px)"],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className={`relative w-full bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black/90 dark:from-gray-800 dark:via-gray-900 dark:to-black border border-white/10 dark:border-gray-700/30 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={modalVariants}
                layoutId="modal"
                whileHover={{
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                  scale: 1.01,
                  transition: { duration: 0.2 },
                }}
              >
                {" "}
                {/* Background gradient effects */}
                <motion.div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                  <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.4, 0.3],
                      rotate: [0, 45, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-40 -left-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"
                    animate={{
                      scale: [1.2, 1, 1.2],
                      opacity: [0.2, 0.3, 0.2],
                      rotate: [0, -45, 0],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2,
                    }}
                  />
                  <motion.div
                    className="absolute top-20 right-20 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.2, 0.3, 0.2],
                      x: [-10, 10, -10],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  />
                </motion.div>
                <motion.div
                  className="flex items-center justify-between p-5 border-b border-white/10 dark:border-gray-700/50 relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.2 } }}
                >
                  <motion.h3
                    className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 dark:from-white dark:to-gray-400 bg-clip-text text-transparent"
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {title}
                  </motion.h3>
                  <motion.button
                    className="text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white rounded-full text-sm w-8 h-8 flex justify-center items-center border border-white/5 dark:border-gray-700/50 backdrop-blur-sm"
                    onClick={onClose}
                    aria-label="Close"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(255,255,255,0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
                <motion.div
                  className="p-6 relative z-10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.3, duration: 0.3 },
                  }}
                >
                  {children}{" "}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
