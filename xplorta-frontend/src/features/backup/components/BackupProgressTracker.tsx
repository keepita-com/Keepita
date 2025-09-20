import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { BackupProgress } from "../hooks/backup.hooks";
import {
  CheckCircle,
  Loader2,
  Timer,
  CloudUpload,
  Database,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface BackupProgressTrackerProps {
  progress: BackupProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

const stepItemVariants = {
  initial: {
    opacity: 0,
    x: 15,
  },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      delay: index * 0.15,
    },
  }),
};

const circleVariants = {
  initial: {
    scale: 0.6,
    opacity: 0,
  },
  completed: {
    scale: 1,
    opacity: 1,
    background: "linear-gradient(135deg, #8b5cf6 0%, #10b981 100%)", // Purple to green gradient
    boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
  },
  active: {
    scale: 1.1,
    opacity: 1,
    background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)", // Blue-purple gradient
    boxShadow: "0 0 15px rgba(99, 102, 241, 0.6)",
  },
  pending: {
    scale: 0.9,
    opacity: 0.6,
    backgroundColor: "#1e293b", // Dark blue-gray for pending
    boxShadow: "none",
  },
};

const getStepIcon = (name: string, isCompleted: boolean, isActive: boolean) => {
  if (isCompleted) {
    return <CheckCircle className="text-white" size={24} />;
  }

  if (isActive) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Loader2 className="text-white" size={24} />
      </motion.div>
    );
  }

  if (name.toLowerCase().includes("init")) {
    return <Timer className="text-gray-400" size={20} />;
  } else if (name.toLowerCase().includes("upload")) {
    return <CloudUpload className="text-gray-400" size={20} />;
  } else if (
    name.toLowerCase().includes("data") ||
    name.toLowerCase().includes("db")
  ) {
    return <Database className="text-gray-400" size={20} />;
  } else {
    return <ArrowRight className="text-gray-400" size={20} />;
  }
};

const BackupProgressTracker: React.FC<BackupProgressTrackerProps> = ({
  progress,
  isOpen,
}) => {
  if (!isOpen || !progress) return null;

  const steps = progress.steps_data
    ? Object.entries(progress.steps_data)
        .sort((a, b) => {
          const aNum = parseInt(a[0].replace("step_", ""));
          const bNum = parseInt(b[0].replace("step_", ""));
          return aNum - bNum;
        })
        .map(([key, data]) => ({
          id: key,
          name: data.name,
          label: data.description,
          status: data.status,
        }))
    : [];

  const activeStep = progress.current_step - 1;
  const pct = progress.progress_percentage || 0;

  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: Math.min(2, steps.length - 1),
  });

  useEffect(() => {
    if (steps.length <= 3) {
      setVisibleRange({ start: 0, end: steps.length - 1 });
      return;
    }

    if (activeStep < visibleRange.start) {
      setVisibleRange({
        start: Math.max(0, activeStep),
        end: Math.min(steps.length - 1, activeStep + 2),
      });
    } else if (activeStep > visibleRange.end) {
      setVisibleRange({
        start: Math.max(0, activeStep - 2),
        end: Math.min(steps.length - 1, activeStep),
      });
    }
  }, [activeStep, steps.length]);

  const showPrevious = () => {
    if (visibleRange.start > 0) {
      const newStart = Math.max(0, visibleRange.start - 3);
      setVisibleRange({
        start: newStart,
        end: Math.min(steps.length - 1, newStart + 2),
      });
    }
  };

  const showNext = () => {
    if (visibleRange.end < steps.length - 1) {
      const newStart = Math.min(steps.length - 3, visibleRange.start + 3);
      setVisibleRange({
        start: newStart,
        end: Math.min(steps.length - 1, newStart + 2),
      });
    }
  };

  const visibleSteps = steps.slice(visibleRange.start, visibleRange.end + 1);

  return (
    <div className="w-full mx-auto p-5 pt-4 mt-6 pb-10 bg-[#08081d]/95 backdrop-blur rounded-xl shadow-xl">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-white">Backup Progress</h3>
          <motion.div
            className="text-white font-bold px-5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-base"
            animate={{
              color: "#ffffff",
              boxShadow: "0 0 10px rgba(79, 70, 229, 0.4)",
            }}
            transition={{ duration: 0.5 }}
          >
            {Math.round(pct)}%
          </motion.div>
        </div>

        <div className="relative h-3 bg-gray-800/80 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
          />
        </div>

        {/* Step counter indicator */}
        <div className="flex justify-between items-center mb-3 text-sm text-gray-400">
          <span>
            Step {activeStep + 1} of {steps.length}
          </span>
          <span>
            Showing {visibleRange.start + 1}-{visibleRange.end + 1} of{" "}
            {steps.length}
          </span>
        </div>

        {/* Horizontal slider with navigation buttons */}
        <div className="flex items-center">
          {/* Previous button */}
          {steps.length > 3 && (
            <button
              onClick={showPrevious}
              disabled={visibleRange.start === 0}
              className={`flex-shrink-0 mr-3 w-9 h-9 flex items-center justify-center rounded-full ${
                visibleRange.start === 0
                  ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                  : "bg-indigo-900/60 text-indigo-300 hover:bg-indigo-800/80"
              }`}
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Horizontal stepper */}
          <div className="flex-grow overflow-hidden relative">
            <div className="flex justify-between items-start relative">
              {/* Background connector lines - match the design in image */}
              <div className="absolute top-6 left-[16.5%] right-[16.5%] h-[2px] bg-gray-700/70 z-0"></div>

              {/* First connector */}
              <div className="absolute top-6 left-[16.5%] w-[33.3%] h-[2px] z-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: activeStep > visibleRange.start ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>

              {/* Second connector */}
              <div className="absolute top-6 left-[50%] w-[33.3%] h-[2px] z-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: activeStep > visibleRange.start + 1 ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>

              {visibleSteps.map((step, idx) => {
                const originalIdx = idx + visibleRange.start;
                const isCompleted =
                  step.status === "completed" || originalIdx < activeStep;
                const isActive = originalIdx === activeStep;

                return (
                  <motion.div
                    key={step.id}
                    className="flex flex-col items-center z-10 w-1/3 px-3 py-2"
                    custom={idx}
                    initial="initial"
                    animate="animate"
                    variants={stepItemVariants}
                  >
                    {/* Step circle */}
                    <motion.div
                      className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-700/60 mb-3"
                      variants={circleVariants}
                      initial="initial"
                      animate={
                        isCompleted
                          ? "completed"
                          : isActive
                          ? "active"
                          : "pending"
                      }
                      transition={{ duration: 0.4 }}
                    >
                      {getStepIcon(step.name, isCompleted, isActive)}
                    </motion.div>

                    {/* Step name */}
                    <h4
                      className={`font-medium text-base text-center ${
                        isCompleted
                          ? "text-violet-400"
                          : isActive
                          ? "text-indigo-300"
                          : "text-gray-400"
                      }`}
                    >
                      {step.name}
                    </h4>

                    {/* Show step description below each step */}
                    <p className="text-sm text-center mt-2 mb-2 text-gray-400">
                      {step.label}
                    </p>

                    {/* Only show status tooltip when active/completed */}
                    {(isActive || isCompleted) && (
                      <motion.div
                        className={`absolute bottom-full left-0 right-0 mb-2 p-2 rounded-md shadow-lg z-20 ${
                          isCompleted
                            ? "bg-violet-900/30 border border-violet-500/30"
                            : "bg-indigo-900/40 border border-indigo-500/50"
                        }`}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-sm text-center mb-2">{step.label}</p>

                        {isCompleted ? (
                          <div className="flex items-center justify-center text-sm text-violet-400">
                            <CheckCircle size={16} className="mr-1" />
                            Completed
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-sm text-indigo-300">
                            <Loader2 size={16} className="mr-1 animate-spin" />
                            Processing...
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Next button */}
          {steps.length > 3 && (
            <button
              onClick={showNext}
              disabled={visibleRange.end >= steps.length - 1}
              className={`flex-shrink-0 ml-3 w-9 h-9 flex items-center justify-center rounded-full ${
                visibleRange.end >= steps.length - 1
                  ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                  : "bg-indigo-900/60 text-indigo-300 hover:bg-indigo-800/80"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupProgressTracker;
