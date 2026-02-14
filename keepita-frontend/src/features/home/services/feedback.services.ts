import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import type {
  FeedbackRequest,
  FeedbackResponse,
} from "../types/feedback.types";

import { submitFeedback } from "../api/feedback.api";

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<FeedbackResponse, Error, FeedbackRequest>({
    mutationFn: submitFeedback,
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      queryClient.invalidateQueries({ queryKey: ["user", "dashboard"] });
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to submit feedback. Please try again.",
      );
    },
  });
};
