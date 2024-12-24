import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isWithinInterval
} from 'date-fns';

import { useAppSelector } from '../../../store';
import {
  selectEvents,
  selectCurrentDate
} from '../../../store/slices/calendarSlice';
import { CalendarEvent } from '../../../types/calendar';

interface MonthViewProps {
  onEventClick: (eventId: string) => void;
}

const MAX_EVENTS_PER_DAY = 3;

const MonthView: React.FC<MonthViewProps> = ({ onEventClick }) => {
  const theme = useTheme();
  const events = useAppSelector(selectEvents);
  const currentDate = parseISO(useAppSelector(selectCurrentDate));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = Array.from(
    { length: Math.ceil(days.length / 7) },
    (_, i) => days.slice(i * 7, (i + 1) * 7)
  );

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const start = parseISO(event.startTime);
      const end = parseISO(event.endTime);
      return isSameDay(date, start) || 
             (event.isAllDay && isWithinInterval(date, { start, end }));
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header row with day names */}
      <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box
            key={day}
            sx={{
              flex: 1,
              p: 1,
              textAlign: 'center',
              borderLeft: 1,
              borderColor: 'divider',
              '&:first-of-type': {
                borderLeft: 0,
              },
            }}
          >
            <Typography variant="subtitle2">{day}</Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {weeks.map((week, weekIndex) => (
          <Box
            key={weekIndex}
            sx={{
              flex: 1,
              display: 'flex',
              borderBottom: 1,
              borderColor: 'divider',
              '&:last-child': {
                borderBottom: 0,
              },
            }}
          >
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <Box
                  key={dayIndex}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 0.5,
                    borderLeft: 1,
                    borderColor: 'divider',
                    bgcolor: isToday ? 'action.hover' : 'background.paper',
                    opacity: isCurrentMonth ? 1 : 0.5,
                    '&:first-of-type': {
                      borderLeft: 0,
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      textAlign: 'right',
                      p: 0.5,
                      fontWeight: isToday ? 'bold' : 'normal',
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    {dayEvents.slice(0, MAX_EVENTS_PER_DAY).map(event => (
                      <Paper
                        key={event.id}
                        sx={{
                          mb: 0.5,
                          p: 0.5,
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.main,
                          },
                        }}
                        onClick={() => onEventClick(event.id)}
                      >
                        <Typography variant="caption" noWrap>
                          {event.isAllDay ? (
                            event.subject
                          ) : (
                            <>
                              {format(parseISO(event.startTime), 'h:mm a')} -{' '}
                              {event.subject}
                            </>
                          )}
                        </Typography>
                      </Paper>
                    ))}
                    {dayEvents.length > MAX_EVENTS_PER_DAY && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', pl: 0.5 }}
                      >
                        +{dayEvents.length - MAX_EVENTS_PER_DAY} more
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MonthView;
