import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Fab,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  format,
  isSameDay,
  parseISO,
  isWithinInterval
} from 'date-fns';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  getEvents,
  selectEvents,
  selectIsLoading,
  selectError,
  setCurrentDate,
  setView,
  selectView,
  selectCurrentDate
} from '../../store/slices/calendarSlice';
import { CalendarView as ViewType } from '../../types/calendar';
import EventDialog from './EventDialog';
import EventView from './EventView';
import DayView from './views/DayView';
import WeekView from './views/WeekView';
import MonthView from './views/MonthView';

const Calendar: React.FC = () => {
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectEvents);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const view = useAppSelector(selectView);
  const currentDate = useAppSelector(selectCurrentDate);
  const theme = useTheme();

  useEffect(() => {
    loadEvents();
  }, [currentDate, view]);

  const loadEvents = async () => {
    let start: Date;
    let end: Date;
    const date = parseISO(currentDate);

    switch (view) {
      case 'day':
        start = date;
        end = date;
        break;
      case 'week':
        start = startOfWeek(date);
        end = endOfWeek(date);
        break;
      case 'month':
        start = startOfMonth(date);
        end = endOfMonth(date);
        break;
      default:
        start = date;
        end = date;
    }

    await dispatch(getEvents({
      startDate: start.toISOString(),
      endDate: end.toISOString()
    }));
  };

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: ViewType | null
  ) => {
    if (newView) {
      dispatch(setView(newView));
    }
  };

  const handlePrevious = () => {
    const date = parseISO(currentDate);
    let newDate: Date;

    switch (view) {
      case 'day':
        newDate = addDays(date, -1);
        break;
      case 'week':
        newDate = addWeeks(date, -1);
        break;
      case 'month':
        newDate = addMonths(date, -1);
        break;
      default:
        newDate = date;
    }

    dispatch(setCurrentDate(newDate.toISOString()));
  };

  const handleNext = () => {
    const date = parseISO(currentDate);
    let newDate: Date;

    switch (view) {
      case 'day':
        newDate = addDays(date, 1);
        break;
      case 'week':
        newDate = addWeeks(date, 1);
        break;
      case 'month':
        newDate = addMonths(date, 1);
        break;
      default:
        newDate = date;
    }

    dispatch(setCurrentDate(newDate.toISOString()));
  };

  const handleToday = () => {
    dispatch(setCurrentDate(new Date().toISOString()));
  };

  const handleCreateEvent = () => {
    setCreateEventOpen(true);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const renderView = () => {
    switch (view) {
      case 'day':
        return <DayView onEventClick={handleEventClick} />;
      case 'week':
        return <WeekView onEventClick={handleEventClick} />;
      case 'month':
        return <MonthView onEventClick={handleEventClick} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="calendar view"
            size="small"
          >
            <ToggleButton value="day" aria-label="day view">
              Day
            </ToggleButton>
            <ToggleButton value="week" aria-label="week view">
              Week
            </ToggleButton>
            <ToggleButton value="month" aria-label="month view">
              Month
            </ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handlePrevious}>
              <ChevronLeftIcon />
            </IconButton>
            <Button
              startIcon={<TodayIcon />}
              onClick={handleToday}
            >
              Today
            </Button>
            <IconButton onClick={handleNext}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Typography variant="h6">
            {format(parseISO(currentDate), 'MMMM yyyy')}
          </Typography>
        </Box>
      </Paper>
      <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {renderView()}
      </Box>
      <Fab
        color="primary"
        aria-label="add event"
        onClick={handleCreateEvent}
        sx={{
          position: 'fixed',
          bottom: theme.spacing(3),
          right: theme.spacing(3),
        }}
      >
        <AddIcon />
      </Fab>
      <EventDialog
        open={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
      />
      {selectedEventId && (
        <EventView
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </Box>
  );
};

export default Calendar;
