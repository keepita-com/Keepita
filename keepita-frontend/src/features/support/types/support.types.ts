export type TicketStatus = "open" | "pending" | "closed" | "resolved";
export type TicketPriority = "low" | "medium" | "high";
export type CommentReaction = "👍" | "👎" | "❤️" | "🤝" | "🙏";

export interface TicketUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface SupportTicket {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: TicketStatus;
  priority: TicketPriority;
  user: TicketUser;
}

export interface TicketComment {
  id: number;
  ticket: number;
  user: TicketUser;
  comment_text: string;
  reaction?: CommentReaction | null;
  attachment?: string | null;
  created_at: string;
}

export interface TicketStats {
  total_tickets: number;
  open_tickets: number;
  closed_tickets: number;
  high_priority_tickets: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority?: TicketPriority;
}

export interface CreateCommentRequest {
  comment_text: string;
  reaction?: CommentReaction;
  attachment?: File;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface PaginatedTicketResult {
  result_count: number;
  total_pages: number;
  next_page: string | null;
  previous_page: string | null;
  has_next: boolean;
  has_previous: boolean;
  total_results: number;
  current_page: number;
  results: SupportTicket[];
}
export interface TicketQueryParams {
  page?: number;
  status?: string;
  priority?: string;
  search?: string;
  ordering?: string;
}
