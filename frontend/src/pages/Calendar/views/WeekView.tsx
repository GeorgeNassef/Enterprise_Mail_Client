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
  startOfWeek,
  addDays,
  isSameDay,
  isWithinInterval,
  endOfDay,
  startOfDay
} from 'date-fns';

import { useAppSelector } from '../../../store';
import {
  selectEvents,
  selectCurrentDate
} from '../../../store/slices/calendarSlice';
import { CalendarEvent } from '../../../types/calendar';

interface WeekViewProps {
  onEventClick: (eventId: string) => void;
}

const DAYS = Array.from({ length: 7 }, (_, i) => i);
const ALL_DAY_HEIGHT = 50;
const HOUR_HEIGHT = 60;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const WeekView: React.FC<WeekViewProps> = ({ onEventClick }) => {
  const theme = useTheme();
  const events = useAppSelector(selectEvents);
  const currentDate = parseISO(useAppSelector(selectCurrentDate));
  const weekStart = startOfWeek(currentDate);

  const getEventsForDay = (dayIndex: number) => {
    const day = addDays(weekStart, dayIndex);
    return events.filter(event => {
      const start = parseISO(event.startTime);
      const end = parseISO(event.endTime);
      return isSameDay(day, start) || 
             (event.isAllDay && isWithinInterval(day, { start, end }));
    });
  };

  const calculateEventPosition = (event: CalendarEvent) => {
    const eventStart = parseISO(event.startTime);
    const eventEnd = parseISO(event.endTime);
    const dayStart = startOfDay(eventStart);
    
    const startMinutes = (eventStart.getTime() - dayStart.getTime()) / (1000 * 60);
    const endMinutes = (eventEnd.getTime() - dayStart.getTime()) / (1000 * 60);
    
    const top = (startMinutes / 60) * HOUR_HEIGHT;
    const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;
    
    return { top, height };
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header row with day names */}
      <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ width: 60 }} /> {/* Time column spacer */}
        {DAYS.map(dayIndex => {
          const date = addDays(weekStart, dayIndex);
          return (
            <Box
              key={dayIndex}
              sx={{
                flex: 1,
                p: 1,
                textAlign: 'center',
                borderLeft: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2">
                {format(date, 'EEE')}
              </Typography>
              <Typography variant="caption">
                {format(date, 'MMM d')}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* All-day events section */}
      <Box
        sx={{
          display: 'flex',
          height: ALL_DAY_HEIGHT,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 60,
            p: 1,
            borderRight: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption">All day</Typography>
        </Box>
        {DAYS.map(dayIndex => {
          const events = getEventsForDay(dayIndex).filter(e => e.isAllDay);
          return (
            <Box
              key={dayIndex}
              sx={{
                flex: 1,
                p: 0.5,
                borderLeft: 1,
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              {events.map(event => (
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
                    {event.subject}
                  </Typography>
                </Paper>
              ))}
            </Box>
          );
        })}
      </Box>

      {/* Timed events grid */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ position: 'relative', minHeight: HOUR_HEIGHT * 24 }}>
          {HOURS.map(hour => (
            <Box
              key={hour}
              sx={{
                position: 'absolute',
                top: hour * HOUR_HEIGHT,
                left: 0,
                right: 0,
                height: HOUR_HEIGHT,
                display: 'flex',
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  width: 60,
                  p: 1,
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption">
                  {format(addDays(startOfDay(currentDate), 0).setHours(hour), 'h a')}
                </Typography>
              </Box>
              {DAYS.map(dayIndex => {
                const events = getEventsForDay(dayIndex).filter(e => !e.isAllDay);
                return (
                  <Box
                    key={dayIndex}
                    sx={{
                      flex: 1,
                      position: 'relative',
                      borderLeft: 1,
                      borderColor: 'divider',
                    }}
                  >
                    {events.map(event => {
                      const { top, height } = calculateEventPosition(event);
                      if (top >= hour * HOUR_HEIGHT && top < (hour + 1) * HOUR_HEIGHT) {
                        return (
                          <Paper
                            key={event.id}
                            sx={{
                              position: 'absolute',
                              top: `${top - hour * HOUR_HEIGHT}px`,
                              height: `${height}px`,
                              left: '2px',
                              right: '2px',
                              backgroundColor: theme.palette.primary.light,
                              color: theme.palette.primary.contrastText,
                              p: 0.5,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: theme.palette.primary.main,
                              },
                            }}
                            onClick={() => onEventClick(event.id)}
                          >
                            <Typography variant="caption" noWrap>
                              {event.subject}
                            </Typography>
                            {height > 30 && (
                              <Typography variant="caption" noWrap display="block">
                                {format(parseISO(event.startTime), 'h:mm a')}
                              </Typography>
                            )}
                          </Paper>
                        );
                      }
                      return null;
                    })}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default WeekView;
