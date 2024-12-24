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
  addHours,
  startOfDay,
  isSameDay,
  isWithinInterval,
  addMinutes
} from 'date-fns';

import { useAppSelector } from '../../../store';
import {
  selectEvents,
  selectCurrentDate
} from '../../../store/slices/calendarSlice';
import { CalendarEvent } from '../../../types/calendar';

interface DayViewProps {
  onEventClick: (eventId: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // pixels per hour

const DayView: React.FC<DayViewProps> = ({ onEventClick }) => {
  const theme = useTheme();
  const events = useAppSelector(selectEvents);
  const currentDate = parseISO(useAppSelector(selectCurrentDate));

  const getEventsForHour = (hour: number) => {
    const hourStart = addHours(startOfDay(currentDate), hour);
    const hourEnd = addHours(hourStart, 1);

    return events.filter(event => {
      if (event.isAllDay) return false;
      
      const start = parseISO(event.startTime);
      const end = parseISO(event.endTime);
      
      return isWithinInterval(hourStart, { start, end }) ||
             isWithinInterval(hourEnd, { start, end }) ||
             (start <= hourStart && end >= hourEnd);
    });
  };

  const calculateEventPosition = (event: CalendarEvent, hourStart: Date) => {
    const eventStart = parseISO(event.startTime);
    const eventEnd = parseISO(event.endTime);
    const dayStart = startOfDay(currentDate);
    
    const startMinutes = Math.max(
      (eventStart.getTime() - dayStart.getTime()) / (1000 * 60),
      0
    );
    const endMinutes = Math.min(
      (eventEnd.getTime() - dayStart.getTime()) / (1000 * 60),
      24 * 60
    );
    
    const top = (startMinutes / 60) * HOUR_HEIGHT;
    const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;
    
    return { top, height };
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ position: 'relative', minHeight: HOUR_HEIGHT * 24 }}>
        {HOURS.map(hour => {
          const hourStart = addHours(startOfDay(currentDate), hour);
          const hourEvents = getEventsForHour(hour);

          return (
            <Box
              key={hour}
              sx={{
                position: 'absolute',
                top: hour * HOUR_HEIGHT,
                left: 0,
                right: 0,
                height: HOUR_HEIGHT,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
              }}
            >
              <Box
                sx={{
                  width: 60,
                  p: 1,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption">
                  {format(hourStart, 'h a')}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, position: 'relative' }}>
                {hourEvents.map(event => {
                  const { top, height } = calculateEventPosition(event, hourStart);
                  
                  return (
                    <Paper
                      key={event.id}
                      sx={{
                        position: 'absolute',
                        top: `${top}px`,
                        height: `${height}px`,
                        left: '4px',
                        right: '4px',
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                        p: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                      onClick={() => onEventClick(event.id)}
                    >
                      <Typography variant="subtitle2" noWrap>
                        {event.subject}
                      </Typography>
                      {height > 40 && (
                        <Typography variant="caption" noWrap>
                          {format(parseISO(event.startTime), 'h:mm a')} -{' '}
                          {format(parseISO(event.endTime), 'h:mm a')}
                        </Typography>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default DayView;
