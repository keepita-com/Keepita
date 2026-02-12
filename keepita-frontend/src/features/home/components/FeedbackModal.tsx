import React, { useState, useEffect } from "react";
import {
  Bug,
  Lightbulb,
  Layout,
  HelpCircle,
  Send,
  Loader2,
} from "lucide-react";
import Modal from "../../../shared/components/Modal";
import { useSubmitFeedback } from "../services/feedback.services";
import type { FeedbackType } from "../types/feedback.types";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { mutate: submitFeedback, isPending } = useSubmitFeedback();
  const [type, setType] = useState<FeedbackType>("other");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setType("other");
        setComment("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const feedbackTypes: {
    id: FeedbackType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "bug", label: "Report Bug", icon: <Bug size={20} /> },
    { id: "feature", label: "Feature", icon: <Lightbulb size={20} /> },
    { id: "ux", label: "UX / UI", icon: <Layout size={20} /> },
    { id: "other", label: "Other", icon: <HelpCircle size={20} /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    submitFeedback({ type, comment }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Feedback" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            What kind of feedback would you like to share?
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {feedbackTypes.map((item) => {
              const isSelected = type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`
                    flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                    ${
                      isSelected
                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-900/20"
                        : "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-gray-400 hover:text-gray-200"
                    }
                  `}
                >
                  <div
                    className={`${isSelected ? "scale-110" : ""} transition-transform duration-200`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Your Comments
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you like or how we can improve..."
            className="w-full h-32 px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl 
              text-gray-200 placeholder-gray-600 
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 
              resize-none transition-all"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!comment.trim() || isPending}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-300
              ${
                !comment.trim() || isPending
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
              }
            `}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send Feedback</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FeedbackModal;
