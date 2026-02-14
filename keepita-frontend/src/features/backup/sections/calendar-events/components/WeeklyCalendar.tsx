import { useState } from "react";
import { motion } from "framer-motion";
import { addWeeks, subWeeks } from "date-fns";
import { useParams } from "react-router-dom";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import CalendarHeader from "./CalendarHeader";
import MiniCalendar from "./MiniCalendar";
import TimeGrid from "./TimeGrid";
import CategoryFilter from "./CategoryFilter";

const WeeklyCalendar = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, isLoading, categories } = useCalendarEvents(backupId);
  const [visibleCategories, setVisibleCategories] = useState<string[]>(
    categories.map((c) => c.id),
  );

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());
  const handleDateSelect = (date: Date) => setCurrentDate(date);

  const handleCategoryToggle = (categoryId: string) => {
    setVisibleCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const categoriesWithVisibility = categories.map((c) => ({
    ...c,
    isVisible: visibleCategories.includes(c.id),
  }));

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-48 border-r border-border p-4 space-y-4">
          <div className="skeleton h-48 w-full"></div>
          <div className="skeleton h-32 w-full"></div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="skeleton h-12 w-full"></div>
          <div className="skeleton h-96 w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen bg-background overflow-hidden"
    >
      <motion.aside
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-48 border-r border-border flex flex-col"
      >
        <div className="p-4">
          <MiniCalendar
            selectedDate={currentDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        <div className="flex-1" />

        <div className="p-4 border-t border-border">
          <CategoryFilter
            categories={categoriesWithVisibility}
            onToggle={handleCategoryToggle}
          />
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <CalendarHeader
          currentDate={currentDate}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onToday={handleToday}
        />

        <TimeGrid currentDate={currentDate} events={events} />
      </main>
    </motion.div>
  );
};

export default WeeklyCalendar;
