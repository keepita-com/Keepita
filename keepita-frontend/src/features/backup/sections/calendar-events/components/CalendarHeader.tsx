import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
}

const CalendarHeader = ({ currentDate, onPrevWeek, onNextWeek, onToday }: CalendarHeaderProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4 py-4 border-b border-border"
        >
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-light text-foreground">
                    <span className="font-bold">{format(currentDate, 'MMMM')}</span>{' '}
                    {format(currentDate, 'yyyy')}
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onPrevWeek}
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToday}
                    className="px-4 py-1 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors"
                >
                    Today
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNextWeek}
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                >
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.button>
            </div>
        </motion.div>
    );
};

export default CalendarHeader;