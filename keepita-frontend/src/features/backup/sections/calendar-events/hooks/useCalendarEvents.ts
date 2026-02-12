import { useState, useEffect, useCallback } from "react";
import type {
  CalendarCategory,
  CalendarEvent,
  CalendarEventDTO,
} from "../types/calendar.types";
import { getCalendarEvents } from "../api/calendarEvents.api"; 

const mapApiEventToUI = (apiEvent: CalendarEventDTO): CalendarEvent => {
  return {
    id: String(apiEvent.id), 
    summary: apiEvent.summary,
    startDate: new Date(apiEvent.start_date), 
    endDate: new Date(apiEvent.end_date),
    location: apiEvent.location || "",
    category: "work",
    color: "hsl(200 70% 50%)", 
    isAllDay: false, 
  };
};

export const useCalendarEvents = (backupId: number | string | undefined) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const categories: CalendarCategory[] = [
    { id: "gym", name: "Gym", color: "hsl(142 76% 36%)", isVisible: true },
    {
      id: "hot-yoga",
      name: "Hot Yoga",
      color: "hsl(340 82% 52%)",
      isVisible: true,
    },
    { id: "work", name: "Work", color: "hsl(45 93% 47%)", isVisible: true },
  ];

  const fetchEvents = useCallback(async () => {
    if (!backupId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await getCalendarEvents(backupId);

      if (response.status && response.data?.results) {
        const mappedEvents = response.data.results.map(mapApiEventToUI);
        setEvents(mappedEvents);
      } else {
        throw new Error(response.message || "Failed to load data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch events");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [backupId]);

  useEffect(() => {
    if (backupId) {
      fetchEvents();
    }
  }, [fetchEvents, backupId]);

  return { events, isLoading, error, categories, refetch: fetchEvents };
};
