import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Autocomplete,
  Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { format } from 'date-fns';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  createEvent,
  updateEvent,
  selectIsLoading,
  selectError
} from '../../store/slices/calendarSlice';
import { CreateEventData, UpdateEventData } from '../../types/calendar';

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  event?: UpdateEventData;
}

const validationSchema = yup.object({
  subject: yup
    .string()
    .required('Subject is required'),
  startTime: yup
    .string()
    .required('Start time is required'),
  endTime: yup
    .string()
    .required('End time is required')
    .test('is-after-start', 'End time must be after start time', function(value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return new Date(value) > new Date(startTime);
    }),
  location: yup
    .string(),
  attendees: yup
    .array()
    .of(yup.string().email('Invalid email address')),
});

const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onClose,
  event
}) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const formik = useFormik({
    initialValues: {
      subject: event?.subject || '',
      startTime: event?.startTime || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: event?.endTime || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      location: event?.location || '',
      body: event?.body || '',
      isAllDay: event?.isAllDay || false,
      attendees: event?.attendees || [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (event) {
          await dispatch(updateEvent({
            id: event.id,
            ...values,
          })).unwrap();
        } else {
          await dispatch(createEvent(values)).unwrap();
        }
        handleClose();
      } catch (err) {
        // Error will be handled by the Redux store
        console.error('Failed to save event:', err);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {event ? 'Edit Event' : 'Create Event'}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            id="subject"
            name="subject"
            label="Subject"
            margin="normal"
            value={formik.values.subject}
            onChange={formik.handleChange}
            error={formik.touched.subject && Boolean(formik.errors.subject)}
            helperText={formik.touched.subject && formik.errors.subject}
            disabled={isLoading}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.isAllDay}
                onChange={formik.handleChange}
                name="isAllDay"
                disabled={isLoading}
              />
            }
            label="All Day"
          />
          <TextField
            fullWidth
            id="startTime"
            name="startTime"
            label="Start Time"
            type={formik.values.isAllDay ? "date" : "datetime-local"}
            margin="normal"
            value={formik.values.startTime}
            onChange={formik.handleChange}
            error={formik.touched.startTime && Boolean(formik.errors.startTime)}
            helperText={formik.touched.startTime && formik.errors.startTime}
            disabled={isLoading}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            id="endTime"
            name="endTime"
            label="End Time"
            type={formik.values.isAllDay ? "date" : "datetime-local"}
            margin="normal"
            value={formik.values.endTime}
            onChange={formik.handleChange}
            error={formik.touched.endTime && Boolean(formik.errors.endTime)}
            helperText={formik.touched.endTime && formik.errors.endTime}
            disabled={isLoading}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            id="location"
            name="location"
            label="Location"
            margin="normal"
            value={formik.values.location}
            onChange={formik.handleChange}
            error={formik.touched.location && Boolean(formik.errors.location)}
            helperText={formik.touched.location && formik.errors.location}
            disabled={isLoading}
          />
          <Autocomplete
            multiple
            id="attendees"
            options={[]}
            freeSolo
            value={formik.values.attendees}
            onChange={(event, newValue) => {
              formik.setFieldValue('attendees', newValue);
            }}
            renderTags={(value: string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Attendees"
                margin="normal"
                helperText="Enter email addresses"
                error={formik.touched.attendees && Boolean(formik.errors.attendees)}
              />
            )}
            disabled={isLoading}
          />
          <TextField
            fullWidth
            id="body"
            name="body"
            label="Description"
            margin="normal"
            multiline
            rows={4}
            value={formik.values.body}
            onChange={formik.handleChange}
            disabled={isLoading}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {event ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventDialog;
