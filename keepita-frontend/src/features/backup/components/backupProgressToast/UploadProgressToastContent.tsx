import React from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  ChevronsDownUp,
  ChevronsUpDown,
  CircleX,
  Loader,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import type { UploadProgressToastContentProps } from "../../types/uploadProgressToast";
import { useBackupToastStore } from "../../store/uploadToastStore";

export const UploadProgressToastContent = ({
  progress,
  uploadPhase,
  toastId,
}: UploadProgressToastContentProps) => {
  const currentStepRef = React.useRef<HTMLDivElement | null>(null);
  const [isStepsDropdownOpen, setIsStepsDropdownOpen] = React.useState(false);
  const setBackupCreationId = useBackupToastStore(
    (state) => state.setBackupCreationId,
  );

  React.useEffect(() => {
    if (!currentStepRef?.current) return;
    currentStepRef.current?.scrollIntoView();
  }, [progress?.current_step]);

  const handleToastClose = React.useCallback(() => {
    toast.dismiss(toastId);
    if (progress?.status === "completed" || progress?.status === "failed") {
      setBackupCreationId(null);
    }
  }, [toastId, progress?.status]);

  const getUploadPhaseRelative = () => {
    if (uploadPhase === "uploading") {
      return { color: "text-blue-300", text: "Uploading ..." };
    } else if (uploadPhase === "failed") {
      return { color: "text-red-500", text: "Upload has failed" };
    } else {
      return { color: "text-white", text: "" };
    }
  };

  const normalizedCurrentStep = progress
    ? Math.min(Math.max(progress.current_step, 1), progress.total_steps)
    : 1;

  if (uploadPhase === "uploading" || uploadPhase === "failed") {
    return (
      <div className="flex justify-between gap-[10px]">
        <span>
          <p className={`text-[17px] ${getUploadPhaseRelative().color}`}>
            {getUploadPhaseRelative().text}
          </p>
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer"
          onClick={() => handleToastClose()}
        >
          <X color="white" size={19} />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden relative text-[#ddd] max-w-[280px] w-[280px]">
      <div className="fixed z-10 top-0 inset-x-0 px-4 py-2 bg-gray-800/80 backdrop-blur-xs">
        <div className="flex justify-end">
          <p
            className={`font-bold mr-auto ${
              progress?.status === "completed"
                ? "text-green-300"
                : progress?.status === "processing"
                  ? "text-blue-300"
                  : "text-red-500"
            }`}
          >
            Backup {progress?.status === "processing" && "is"}{" "}
            {progress?.status}
          </p>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="cursor-pointer mr-[7px]"
            onClick={() => setIsStepsDropdownOpen((prev) => !prev)}
          >
            {isStepsDropdownOpen ? (
              <ChevronsDownUp color="white" size={17} />
            ) : (
              <ChevronsUpDown color="white" size={19} />
            )}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="cursor-pointer"
            onClick={() => handleToastClose()}
          >
            <X color="white" size={17} />
          </motion.button>
        </div>
        <div className="flex justify-end mt-[10px]">
          <p className="text-[13px]">
            Step {normalizedCurrentStep} of {progress?.total_steps}
          </p>
        </div>
      </div>

      <div
        className="flex flex-col max-h-[300px] overflow-y-scroll mt-[53px] mb-[35px] relative z-0 scroll-smooth"
        style={{
          maxHeight: isStepsDropdownOpen ? "350px" : 0,
          opacity: isStepsDropdownOpen ? 1 : 0,
        }}
      >
        {progress?.total_steps &&
          Array.from({ length: progress.total_steps }, (_, index) => {
            const stepNumber = `step_${index + 1}`;
            const stepData = progress.steps_data?.[stepNumber] || {
              name: `Step ${index + 1}`,
              description: `Awaiting step ${index + 1} details...`,
              status:
                index + 1 < progress.current_step
                  ? "completed"
                  : index + 1 === progress.current_step
                    ? "processing"
                    : "pending",
            };
            const relativeStepIndex = index + 1;

            return (
              <div
                ref={
                  normalizedCurrentStep === relativeStepIndex
                    ? currentStepRef
                    : null
                }
                className="flex gap-2 my-[10px]"
                key={stepNumber}
              >
                <span className="relative self-center rounded-full min-w-[30px] min-h-[30px] flex items-center justify-center">
                  {stepData.status === "completed" ? (
                    <BadgeCheck color="#B0DB9C" />
                  ) : stepData.status === "processing" ? (
                    <Loader className="animate-spin bg-[inherit]" />
                  ) : (
                    <CircleX color="red" />
                  )}
                  <div className="absolute top-[-13px] left-0">
                    <p className="text-[11px]">
                      {stepNumber.replace("step_", "")}
                    </p>
                  </div>
                </span>
                <div className="flex flex-col">
                  <p className="text-[17px] font-semibold">{stepData.name}</p>
                  <p className="text-[13px]">{stepData.description}</p>
                </div>
              </div>
            );
          })}
      </div>

      <div className="fixed z-10 bottom-0 inset-x-0 pl-4 pr-6 py-2 bg-gray-800/80 backdrop-blur-xs flex justify-between items-center">
        <span>
          <div className="min-w-[220px] h-[8px] rounded-full overflow-hidden bg-gray-200">
            <div
              className="bg-blue-600 h-full"
              style={{
                width: `${
                  progress?.progress_percentage &&
                  progress.progress_percentage > 0
                    ? progress.progress_percentage
                    : Math.round(
                        (normalizedCurrentStep /
                          Number(progress?.total_steps)) *
                          100,
                      )
                }%`,
              }}
            />
          </div>
        </span>
        <div className="w-[10%]">
          <p className="font-bold text-[20px]">
            {progress?.progress_percentage && progress.progress_percentage > 0
              ? progress.progress_percentage.toFixed()
              : Math.round(
                  (normalizedCurrentStep / Number(progress?.total_steps)) * 100,
                )}
            %
          </p>
        </div>
      </div>
    </div>
  );
};
