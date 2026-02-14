import { motion } from 'framer-motion';
import type { CalendarEvent as CalendarEventType } from '../types/calendar.types';
import { Video, MapPin, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarEventProps {
    event: CalendarEventType;
    style?: React.CSSProperties;
    isCompact?: boolean;
}

const CalendarEventCard = ({ event, style, isCompact = false }: CalendarEventProps) => {
    const formatTime = (date: Date) => format(date, 'h:mma').toLowerCase();

    const getIcon = () => {
        switch (event.icon) {
            case 'video':
                return <Video className="h-3 w-3" />;
            case 'location':
                return <MapPin className="h-3 w-3" />;
            case 'recurring':
                return <RefreshCw className="h-3 w-3" />;
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="absolute rounded-md px-2 py-1 overflow-hidden cursor-pointer group"
            style={{
                backgroundColor: event.color,
                ...style,
            }}
        >
            <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                    <p className={`font-medium text-foreground truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>
                        {event.summary}
                    </p>
                    {!isCompact && event.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            {getIcon()}
                            <span className="truncate">{event.location}</span>
                        </div>
                    )}
                    {!isCompact && !event.location && !event.isAllDay && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            {getIcon()}
                            <span>{formatTime(event.startDate)}–{formatTime(event.endDate)}</span>
                        </div>
                    )}
                </div>
                {event.icon && !event.location && (
                    <span className="text-muted-foreground opacity-60">{getIcon()}</span>
                )}
            </div>
        </motion.div>
    );
};

export default CalendarEventCard;