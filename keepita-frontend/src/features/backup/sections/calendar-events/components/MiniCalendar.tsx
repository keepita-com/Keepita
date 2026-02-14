import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useState } from 'react';

interface MiniCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const MiniCalendar = ({ selectedDate, onDateSelect }: MiniCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(selectedDate);
    const today = new Date();

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const renderDays = () => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        return (
            <div className="grid grid-cols-7 mb-1">
                {days.map((day, index) => (
                    <div key={index} className="text-center text-xs font-medium text-muted-foreground py-1">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isToday = isSameDay(day, today);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <motion.button
                        key={day.toString()}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDateSelect(cloneDay)}
                        className={`
              h-7 w-7 text-xs rounded-full flex items-center justify-center transition-colors
              ${!isCurrentMonth ? 'text-muted-foreground/40' : 'text-foreground'}
              ${isToday && !isSelected ? 'bg-destructive text-destructive-foreground font-bold' : ''}
              ${isSelected ? 'bg-primary text-primary-foreground' : ''}
              ${!isToday && !isSelected && isCurrentMonth ? 'hover:bg-accent' : ''}
            `}
                    >
                        {format(day, 'd')}
                    </motion.button>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7 gap-0">
                    {days}
                </div>
            );
            days = [];
        }
        return rows;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full"
        >
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-1 hover:bg-accent rounded-full transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <h3 className="text-sm font-semibold text-foreground">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-1 hover:bg-accent rounded-full transition-colors"
                >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
            </div>
            {renderDays()}
            <div className="space-y-0">{renderCells()}</div>
        </motion.div>
    );
};

export default MiniCalendar;
