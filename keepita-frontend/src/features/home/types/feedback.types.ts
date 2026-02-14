export type FeedbackType = "bug" | "ux" | "feature" | "other";

export interface FeedbackRequest {
  type: FeedbackType;
  comment: string;
}

export interface FeedbackResponse {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  rating?: number;
  type: FeedbackType;
  comment: string;
  created_at: string;
}
