import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  Loader2,
  ChevronDown,
  Check,
  AlertTriangle,
  Zap,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../../shared/components/Modal";
import { cn } from "../../../shared/utils/cn";
import type {
  CreateTicketRequest,
  TicketPriority,
} from "../types/support.types";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketRequest) => Promise<boolean>;
}

const PRIORITY_OPTIONS: {
  value: TicketPriority;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "low",
    label: "Low - General Question",
    icon: <Info size={16} />,
    color: "text-blue-400",
  },
  {
    value: "medium",
    label: "Medium - Minor Issue",
    icon: <Zap size={16} />,
    color: "text-orange-400",
  },
  {
    value: "high",
    label: "High - System Failure",
    icon: <AlertTriangle size={16} />,
    color: "text-red-400",
  },
];

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTicketRequest>({
    defaultValues: {
      priority: "low",
    },
  });

  const selectedPriority = watch("priority");
  const currentOption = PRIORITY_OPTIONS.find(
    (opt) => opt.value === selectedPriority,
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormSubmit = async (data: CreateTicketRequest) => {
    setIsSubmitting(true);
    const success = await onSubmit(data);
    setIsSubmitting(false);
    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Support Ticket">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300 ml-1">
            Subject
          </label>
          <input
            {...register("title", { required: "Subject is required" })}
            className={cn(
              "w-full bg-gray-900/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all duration-200",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50",
              errors.title
                ? "border-red-500/50 focus:border-red-500"
                : "border-white/10",
            )}
            placeholder="Brief summary of the issue"
            autoComplete="off"
          />
          {errors.title && (
            <p className="flex items-center gap-1.5 text-red-400 text-xs ml-1 mt-1">
              <AlertCircle size={12} />
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-300 ml-1">
            Priority
          </label>

          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "w-full flex items-center justify-between bg-gray-900/50 border rounded-xl px-4 py-3 text-white outline-none transition-all duration-200",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 hover:bg-white/5",
              isDropdownOpen
                ? "border-blue-500/50 ring-2 ring-blue-500/20"
                : "border-white/10",
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(currentOption?.color)}>
                {currentOption?.icon}
              </span>
              <span className="text-sm font-medium">
                {currentOption?.label}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={cn(
                "text-gray-400 transition-transform duration-200",
                isDropdownOpen && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-2 bg-[#17212b] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1"
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setValue("priority", option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors",
                      "hover:bg-white/5",
                      selectedPriority === option.value ? "bg-blue-500/10" : "",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(option.color)}>{option.icon}</span>
                      <span
                        className={cn(
                          "font-medium",
                          selectedPriority === option.value
                            ? "text-blue-100"
                            : "text-gray-300",
                        )}
                      >
                        {option.label}
                      </span>
                    </div>
                    {selectedPriority === option.value && (
                      <Check size={16} className="text-blue-400" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300 ml-1">
            Description
          </label>
          <textarea
            {...register("description", {
              required: "Description is required",
            })}
            rows={5}
            className={cn(
              "w-full bg-gray-900/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all duration-200 resize-none",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 scrollbar-hide",
              errors.description
                ? "border-red-500/50 focus:border-red-500"
                : "border-white/10",
            )}
            placeholder="Please describe the issue in detail..."
          />
          {errors.description && (
            <p className="flex items-center gap-1.5 text-red-400 text-xs ml-1 mt-1">
              <AlertCircle size={12} />
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-white shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm",
              isSubmitting && "cursor-wait",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Ticket</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTicketModal;
