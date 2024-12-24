import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ContactsState,
  GetContactsParams,
  CreateContactData,
  UpdateContactData,
  Contact,
  ContactsResponse
} from '../../types/contacts';
import { contactsApi } from '../../services/api';

const initialState: ContactsState = {
  contacts: [],
  selectedContact: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  pageToken: null,
  hasMore: true
};

export const getContacts = createAsyncThunk(
  'contacts/getContacts',
  async (params: GetContactsParams, { rejectWithValue }) => {
    try {
      const response = await contactsApi.getContacts(params);
      return response.data as ContactsResponse;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch contacts');
    }
  }
);

export const createContact = createAsyncThunk(
  'contacts/createContact',
  async (contactData: CreateContactData, { rejectWithValue }) => {
    try {
      const response = await contactsApi.createContact(contactData);
      return response.data as Contact;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create contact');
    }
  }
);

export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async (contactData: UpdateContactData, { rejectWithValue }) => {
    try {
      const response = await contactsApi.updateContact(contactData.id, contactData);
      return response.data as Contact;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update contact');
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (contactId: string, { rejectWithValue }) => {
    try {
      await contactsApi.deleteContact(contactId);
      return contactId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete contact');
    }
  }
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.contacts = [];
      state.pageToken = null;
      state.hasMore = true;
    },
    selectContact: (state, action: PayloadAction<Contact | null>) => {
      state.selectedContact = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Contacts
      .addCase(getContacts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = state.pageToken
          ? [...state.contacts, ...action.payload.contacts]
          : action.payload.contacts;
        state.pageToken = action.payload.nextPageToken;
        state.hasMore = !!action.payload.nextPageToken;
      })
      .addCase(getContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Contact
      .addCase(createContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts.unshift(action.payload);
      })
      .addCase(createContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Contact
      .addCase(updateContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contacts.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
        if (state.selectedContact?.id === action.payload.id) {
          state.selectedContact = action.payload;
        }
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Contact
      .addCase(deleteContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = state.contacts.filter(c => c.id !== action.payload);
        if (state.selectedContact?.id === action.payload) {
          state.selectedContact = null;
        }
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, selectContact, clearError } = contactsSlice.actions;

export default contactsSlice.reducer;

// Selectors
export const selectContacts = (state: { contacts: ContactsState }) => state.contacts.contacts;
export const selectSelectedContact = (state: { contacts: ContactsState }) => state.contacts.selectedContact;
export const selectSearchQuery = (state: { contacts: ContactsState }) => state.contacts.searchQuery;
export const selectIsLoading = (state: { contacts: ContactsState }) => state.contacts.isLoading;
export const selectError = (state: { contacts: ContactsState }) => state.contacts.error;
export const selectHasMore = (state: { contacts: ContactsState }) => state.contacts.hasMore;
