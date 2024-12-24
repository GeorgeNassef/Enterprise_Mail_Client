import axios from 'axios';
import { store } from '../store';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Mail endpoints
export const mailApi = {
  getMessages: (params: any) => api.get('/mail/messages', { params }),
  getMessage: (id: string) => api.get(`/mail/messages/${id}`),
  sendMessage: (data: any) => api.post('/mail/messages/send', data),
};

// Calendar endpoints
export const calendarApi = {
  getEvents: (params: any) => api.get('/calendar/events', { params }),
  getEvent: (id: string) => api.get(`/calendar/events/${id}`),
  createEvent: (data: any) => api.post('/calendar/events', data),
  updateEvent: (id: string, data: any) => api.put(`/calendar/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/calendar/events/${id}`),
};

// Contacts endpoints
export const contactsApi = {
  getContacts: (params: any) => api.get('/contacts', { params }),
  getContact: (id: string) => api.get(`/contacts/${id}`),
  createContact: (data: any) => api.post('/contacts', data),
  updateContact: (id: string, data: any) => api.put(`/contacts/${id}`, data),
  deleteContact: (id: string) => api.delete(`/contacts/${id}`),
};

// Auth endpoints
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
};

export default api;
