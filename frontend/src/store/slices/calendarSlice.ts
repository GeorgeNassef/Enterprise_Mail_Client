import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  CalendarState, 
  GetEventsParams, 
  CreateEventData,
  UpdateEventData,
  CalendarEvent,
  EventsResponse
} from '../../types/calendar';
import { calendarApi } from '../../services/api';

const initialState: CalendarState = {
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
  view: 'week',
  currentDate: new Date().toISOString()
};

export const getEvents = createAsyncThunk(
  'calendar/getEvents',
  async (params: GetEventsParams, { rejectWithValue }) => {
    try {
      const response = await calendarApi.getEvents(params);
      return response.data as EventsResponse;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch events');
    }
  }
);

export const createEvent = createAsyncThunk(
  'calendar/createEvent',
  async (eventData: CreateEventData, { rejectWithValue }) => {
    try {
      const response = await calendarApi.createEvent(eventData);
      return response.data as CalendarEvent;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'calendar/updateEvent',
  async (eventData: UpdateEventData, { rejectWithValue }) => {
    try {
      const response = await calendarApi.updateEvent(eventData.id, eventData);
      return response.data as CalendarEvent;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'calendar/deleteEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      await calendarApi.deleteEvent(eventId);
      return eventId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete event');
    }
  }
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<'day' | 'week' | 'month'>) => {
      state.view = action.payload;
    },
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload;
    },
    selectEvent: (state, action: PayloadAction<CalendarEvent | null>) => {
      state.selectedEvent = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Events
      .addCase(getEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload.events;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.events.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = state.events.filter(e => e.id !== action.payload);
        if (state.selectedEvent?.id === action.payload) {
          state.selectedEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setView, setCurrentDate, selectEvent, clearError } = calendarSlice.actions;

export default calendarSlice.reducer;

// Selectors
export const selectEvents = (state: { calendar: CalendarState }) => state.calendar.events;
export const selectSelectedEvent = (state: { calendar: CalendarState }) => state.calendar.selectedEvent;
export const selectView = (state: { calendar: CalendarState }) => state.calendar.view;
export const selectCurrentDate = (state: { calendar: CalendarState }) => state.calendar.currentDate;
export const selectIsLoading = (state: { calendar: CalendarState }) => state.calendar.isLoading;
export const selectError = (state: { calendar: CalendarState }) => state.calendar.error;
