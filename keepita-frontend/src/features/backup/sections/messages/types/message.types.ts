import type { ApiResponseList } from "../../../../../core/types/apiResponse";

export interface MessageThread {
  id: number;
  address: string;
  contact?: {
    id: number;
    name: string;
    phone_number: string;
    display_name?: string;
    profile_image?: string;
    is_favorite?: boolean;
  };
  created_at: string;
  last_message: string;
  last_message_date: string;
  messages_count: number;
  unread_count: number;
}

export interface Message {
  id: number;
  date: string;
  body: string;
  status: number;
  seen: boolean;
  sim_slot: number;
  created_at: string;
  updated_at: string;
}

export interface MessageThreadsResponse extends ApiResponseList<
  MessageThread[]
> {}

export interface MessagesResponse extends ApiResponseList<Message[]> {}

export interface ChatListFilters {
  backup?: number;
  contact?: string;
  address?: string;
  contact_name?: string;
  contact_phone?: string;
  is_favorite_contact?: boolean;
  created_after?: string;
  created_before?: string;
  has_messages?: boolean;
  min_messages?: number;
  max_messages?: number;
  has_unread?: boolean;
  last_message_after?: string;
  last_message_before?: string;

  search?: string;
  ordering?: string;
  [key: string]: boolean | string | number | undefined;
}

export interface ChatMessageFilters {
  backup?: number;
  chat_thread?: number;
  body?: string;
  body_exact?: string;
  body_empty?: boolean;
  status?: number;
  seen?: boolean;
  sim_slot?: number;
  date_after?: string;
  date_before?: string;
  date_range?: string;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  contact?: string;
  contact_name?: string;
  contact_phone?: string;
  address?: string;

  search?: string;
  ordering?: string;

  page?: number;
  page_size?: number;
}

export interface MessageFilters {
  search?: string;
  contact?: string;
  unread_only?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface MessageState {
  threads: MessageThread[];
  currentThread: MessageThread | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  filters: MessageFilters;
  hasMore: boolean;
  page: number;
}

export type MessageType = "incoming" | "outgoing";

export interface ConversationGroup {
  date: string;
  messages: Message[];
}
