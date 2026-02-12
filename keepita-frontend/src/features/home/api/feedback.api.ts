import { DataProvider } from "../../../core/api/dataProvider";

import type {
  FeedbackRequest,
  FeedbackResponse,
} from "../types/feedback.types";

export const submitFeedback = async (data: FeedbackRequest) => {
  const response = await DataProvider.post<FeedbackResponse, FeedbackRequest>(
    "support/feedback/",
    data,
  );

  return response.data;
};
