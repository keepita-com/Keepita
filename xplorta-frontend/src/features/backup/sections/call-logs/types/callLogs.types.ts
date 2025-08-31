import type { ApiResponseList } from "../../../../../core/types/apiResponse";

export interface CallLog {
  id: number;
  number: string;
  name: string;
  date: string; // ISO 8601 date string
  call_date_formatted: string;
  type: CallType;
  call_type_display: string;
  duration: number; // Duration in seconds
  duration_display: string;
  contact_name: string;
  contact_id: number | null;
  contact_phone: string;
  created_at: string; // ISO 8601 date string
}

export type CallType = "INCOMING" | "OUTGOING" | "MISSED";

export type CallLogsApiResponse = ApiResponseList<CallLog[]>;

export interface GetCallLogsParams {
  // Pagination
  page?: number;
  page_size?: number;

  // Sorting
  ordering?: string;

  // Filters
  search?: string;
  number?: string;
  name?: string;
  call_type?: CallType;
  contact_name?: string;
  date_from?: string; // yyyy-MM-dd
  date_to?: string; // yyyy-MM-dd
  date_range?: string;
  duration_min?: number;
  duration_max?: number;
  duration_range?: string;
  has_contact?: boolean;
  missed_calls?: boolean;
}

export const CALL_LOGS_SEARCH_FIELDS = ["number", "name"] as const;

export const CALL_LOGS_ORDERING_FIELDS = [
  "created_at",
  "date",
  "duration",
  "type",
] as const;
