export interface CalendarEvent {
  id: string;
  summary: string;
  startDate: Date; 
  endDate: Date;
  category: string;
  color: string;
  location?: string;
  isAllDay?: boolean;
  icon?: "video" | "location" | "recurring";
}

export interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
}

export type ViewMode = "week" | "day" | "month";

export interface CalendarEventDTO {
  id: number;
  backup: number;
  summary: string;
  start_date: string; 
  end_date: string;
  location?: string;
}

export interface CalendarPaginationData {
  result_count: number;
  total_pages: number;
  next_page: string | null;
  previous_page: string | null;
  has_next: boolean;
  has_previous: boolean;
  total_results: number;
  current_page: number;
  results: CalendarEventDTO[];
}

export interface CalendarEventsResponse {
  status: boolean;
  data: CalendarPaginationData;
  message: string;
}
