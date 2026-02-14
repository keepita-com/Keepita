import { DataProvider } from "../../../../../core/api/dataProvider";
import type { CalendarEventsResponse } from "../types/calendar.types";

const RESOURCE = "dashboard";

const CALENDAR_API_ENDPOINTS = {
  EVENTS: (backupId: number) =>
    `${RESOURCE}/backups/${backupId}/calendarevent/`,
} as const;


export const getCalendarEvents = async (
  backupId: number | string | undefined
): Promise<CalendarEventsResponse> => {
  if (!backupId) {
    throw new Error("Backup ID is required");
  }

  const numericBackupId =
    typeof backupId === "string" ? parseInt(backupId, 10) : backupId;

  if (isNaN(numericBackupId)) {
    throw new Error("Invalid backup ID");
  }

  const endpoint = CALENDAR_API_ENDPOINTS.EVENTS(numericBackupId);

  try {
    const response = await DataProvider.get<CalendarEventsResponse>(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
};
