export interface Attendee {
  email: string;
  name?: string;
  response?: 'accepted' | 'declined' | 'tentative' | 'none';
}

export interface CalendarEvent {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  location?: string;
  body?: string;
  isAllDay: boolean;
  attendees?: Attendee[];
  organizer: string;
  recurrence?: string;
  createdTime: string;
  modifiedTime: string;
}

export interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  isLoading: boolean;
  error: string | null;
  view: 'day' | 'week' | 'month';
  currentDate: string;
}

export interface GetEventsParams {
  startDate: string;
  endDate: string;
  calendarId?: string;
}

export interface CreateEventData {
  subject: string;
  startTime: string;
  endTime: string;
  location?: string;
  body?: string;
  isAllDay: boolean;
  attendees?: string[];
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: string[];
    dayOfMonth?: number;
    endDate?: string;
    numberOfOccurrences?: number;
  };
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface CalendarView {
  type: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
}

export interface EventsResponse {
  events: CalendarEvent[];
  nextLink?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  events: CalendarEvent[];
}

export interface DayView {
  date: string;
  timeSlots: TimeSlot[];
}

export interface WeekView {
  startDate: string;
  endDate: string;
  days: DayView[];
}

export interface MonthView {
  month: number;
  year: number;
  weeks: WeekView[];
}
