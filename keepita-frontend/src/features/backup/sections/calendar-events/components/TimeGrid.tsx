import { motion } from "framer-motion";
import { format, isSameDay, startOfWeek, addDays } from "date-fns";
import type { CalendarEvent } from "../types/calendar.types";
import CalendarEventCard from "./CalendarEvent";
import { useEffect, useState } from "react";

interface TimeGridProps {
  currentDate: Date;
  events: CalendarEvent[];
}

const TimeGrid = ({ currentDate, events }: TimeGridProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const weekStart = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const hours = Array.from({ length: 12 }, (_, i) => i + 7);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getEventStyle = (event: CalendarEvent) => {
    const startMinutes =
      event.startDate.getHours() * 60 + event.startDate.getMinutes();
    const endMinutes =
      event.endDate.getHours() * 60 + event.endDate.getMinutes();
    const duration = endMinutes - startMinutes;

    const topOffset = ((startMinutes - 7 * 60) / 60) * 54;
    const height = (duration / 60) * 54;

    return {
      top: `${topOffset}px`,
      height: `${Math.max(height, 24)}px`,
      left: "2px",
      right: "2px",
    };
  };

  const getEventsForDay = (day: Date, allDay: boolean) => {
    return events.filter((event) => {
      const eventDay = event.startDate;
      const isOnDay =
        isSameDay(eventDay, day) ||
        (event.isAllDay && event.startDate <= day && event.endDate >= day);
      return isOnDay && (allDay ? event.isAllDay : !event.isAllDay);
    });
  };

  const getCurrentTimePosition = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return ((minutes - 7 * 60) / 60) * 54;
  };

  const isCurrentTimeVisible = () => {
    const hour = currentTime.getHours();
    return hour >= 7 && hour <= 18;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 z-20 bg-background border-b border-border">
        <div className="flex">
          <div className="w-16 shrink-0" />
          {days.map((day, index) => {
            const isToday = isSameDay(day, today);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-1 text-center py-3 border-l border-border"
              >
                <div className="text-sm text-muted-foreground">
                  {format(day, "EEE")} {format(day, "d")}
                </div>
                {isToday && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mx-auto mt-1 h-8 w-8 rounded-full bg-destructive flex items-center justify-center"
                  >
                    <span className="text-sm font-bold text-destructive-foreground">
                      {format(day, "d")}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex border-t border-border">
          <div className="w-16 shrink-0 px-2 py-1 text-xs text-muted-foreground text-right">
            all-day
          </div>
          {days.map((day, dayIndex) => {
            const allDayEvents = getEventsForDay(day, true);
            return (
              <div
                key={dayIndex}
                className="flex-1 border-l border-border p-1 min-h-[60px]"
              >
                <div className="space-y-1">
                  {allDayEvents.map((event, eventIndex) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: eventIndex * 0.05 }}
                      className="px-2 py-0.5 rounded text-xs font-medium truncate"
                      style={{ backgroundColor: event.color }}
                    >
                      {event.summary}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex relative">
        <div className="w-16 shrink-0">
          {hours.map((hour) => (
            <div key={hour} className="h-[54px] relative">
              <span className="absolute -top-2 right-2 text-xs text-muted-foreground">
                {hour === 12
                  ? "Noon"
                  : hour > 12
                    ? `${hour - 12} PM`
                    : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-1">
          {days.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day, false);
            const isToday = isSameDay(day, today);

            return (
              <div
                key={dayIndex}
                className="flex-1 border-l border-border relative"
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[54px] border-b border-border/50"
                  />
                ))}

                {dayEvents.map((event) => (
                  <CalendarEventCard
                    key={event.id}
                    event={event}
                    style={getEventStyle(event)}
                  />
                ))}

                {isToday && isCurrentTimeVisible() && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute left-0 right-0 z-10 flex items-center"
                    style={{ top: `${getCurrentTimePosition()}px` }}
                  >
                    <div className="h-3 w-3 rounded-full bg-destructive -ml-1.5" />
                    <div className="flex-1 h-0.5 bg-destructive" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {isCurrentTimeVisible() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-0 w-16 flex justify-end pr-2"
            style={{ top: `${getCurrentTimePosition() - 10}px` }}
          >
            <span className="text-xs font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
              {format(currentTime, "h:mm")}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TimeGrid;
