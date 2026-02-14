import type { ApiResponseList } from "../../../../../core/types/apiResponse";


export interface Alarm {
  id: number;
  name: string | null;
  time: string; 
  time_display: string; 
  active: boolean;
  status_display: string;
  repeat_type: number;
  repeat_type_display: string;
  created_at: string;
}


export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";


export type DayAbbreviation = "S" | "M" | "T" | "W" | "T" | "F" | "S";


export interface AlarmsApiResponse extends ApiResponseList<Alarm[]> {}


export interface GetAlarmsParams {
  backupId: number;
  page?: number;
  pageSize?: number;
  search?: string; 
  active?: boolean;
  repeat_type?: number;
  time_from?: string;
  time_to?: string;
  created_from?: string;
  created_to?: string;
  ordering?: string; 
}


export type AlarmSortOption = "created_at" | "time" | "name" | "active";


export interface AlarmFilters {
  search?: string;
  active?: boolean;
  repeat_type?: number;
  time_from?: string;
  time_to?: string;
  created_from?: string;
  created_to?: string;
}


export interface AlarmSortConfig {
  field: AlarmSortOption;
  direction: "asc" | "desc";
}


export interface AlarmStats {
  totalAlarms: number;
  activeAlarms: number;
  inactiveAlarms: number;
  customRepeatAlarms: number;
  dailyAlarms: number;
}


export interface AlarmState {
  
  alarms: Alarm[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  stats: AlarmStats | null;

  
  isLoading: boolean;
  error: string | null;

  
  queryParams: GetAlarmsParams;
  sortConfig: AlarmSortConfig;
  filters: AlarmFilters;
}


export interface AlarmActions {
  fetchAlarms: (backupId: number) => Promise<void>;
  updateQueryParams: (params: Partial<GetAlarmsParams>) => void;
  setSortConfig: (config: AlarmSortConfig) => void;
  setFilters: (filters: AlarmFilters) => void;
  clearFilters: () => void;
  reset: () => void;
}


export interface AlarmListProps {
  backupId: number;
  alarms: Alarm[];
  isLoading?: boolean;
  onToggleAlarm?: (alarmId: number, active: boolean) => void;
}

export interface AlarmItemProps {
  alarm: Alarm;
  onToggle?: (active: boolean) => void;
  className?: string;
}

export interface AlarmFiltersProps {
  filters: AlarmFilters;
  onFiltersChange: (filters: AlarmFilters) => void;
  onClearFilters: () => void;
  totalCount?: number;
}

export interface AlarmStatsProps {
  stats: AlarmStats;
  isLoading?: boolean;
}


export type AlarmViewMode = "list" | "grid";


export interface TimeDisplay {
  hours: string;
  minutes: string;
  period?: "AM" | "PM"; 
  is24Hour: boolean;
}


export interface DayPattern {
  type: "none" | "daily" | "weekdays" | "weekends" | "custom";
  display: string;
  days: DayOfWeek[];
}
