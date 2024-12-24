import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

import { useAppDispatch, useAppSelector } from '../../store';
import { selectEvents, deleteEvent } from '../../store/slices/calendarSlice';
import { CalendarEvent } from '../../types/calendar';

interface EventViewProps {
  eventId: string;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
}

const EventView: React.FC<EventViewProps> = ({
  eventId,
  onClose,
  onEdit
}) => {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectEvents);
  const event = events.find(e => e.id === eventId);

  if (!event) {
    return null;
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(event);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteEvent(eventId)).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return event.isAllDay
      ? format(date, 'PPP')
      : format(date, 'PPp');
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {event.subject}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="action" />
            <Box>
              <Typography variant="body1">
                {formatDate(event.startTime)}
              </Typography>
              {!event.isAllDay && (
                <Typography variant="body1">
                  to {formatDate(event.endTime)}
                </Typography>
              )}
            </Box>
          </Box>

          {event.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="action" />
              <Typography variant="body1">
                {event.location}
              </Typography>
            </Box>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="action" />
                <Typography variant="body1">Attendees</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pl: 4 }}>
                {event.attendees.map((attendee, index) => (
                  <Chip
                    key={index}
                    label={attendee}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </>
          )}

          {event.body && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1">
                {event.body}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<DeleteIcon />}
          color="error"
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventView;
