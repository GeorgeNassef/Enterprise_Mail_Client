import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  MailState, 
  GetMessagesParams, 
  SendMessageData, 
  MessageResponse,
  Message
} from '../../types/mail';
import { mailApi } from '../../services/api';

const initialState: MailState = {
  messages: [],
  selectedMessage: null,
  isLoading: false,
  error: null,
  pageToken: null,
  hasMore: true,
  currentFolder: 'inbox'
};

export const getMessages = createAsyncThunk(
  'mail/getMessages',
  async (params: GetMessagesParams, { rejectWithValue }) => {
    try {
      const response = await mailApi.getMessages(params);
      return response.data as MessageResponse;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const getMessage = createAsyncThunk(
  'mail/getMessage',
  async (messageId: string, { rejectWithValue }) => {
    try {
      const response = await mailApi.getMessage(messageId);
      return response.data as Message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch message');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'mail/sendMessage',
  async (messageData: SendMessageData, { rejectWithValue }) => {
    try {
      const response = await mailApi.sendMessage(messageData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
  }
);

const mailSlice = createSlice({
  name: 'mail',
  initialState,
  reducers: {
    setCurrentFolder: (state, action: PayloadAction<string>) => {
      state.currentFolder = action.payload;
      state.messages = [];
      state.pageToken = null;
      state.hasMore = true;
    },
    clearSelectedMessage: (state) => {
      state.selectedMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Messages
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = state.pageToken 
          ? [...state.messages, ...action.payload.messages]
          : action.payload.messages;
        state.pageToken = action.payload.nextPageToken;
        state.hasMore = !!action.payload.nextPageToken;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Message
      .addCase(getMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedMessage = action.payload;
      })
      .addCase(getMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentFolder, clearSelectedMessage, clearError } = mailSlice.actions;

export default mailSlice.reducer;

// Selectors
export const selectMessages = (state: { mail: MailState }) => state.mail.messages;
export const selectSelectedMessage = (state: { mail: MailState }) => state.mail.selectedMessage;
export const selectCurrentFolder = (state: { mail: MailState }) => state.mail.currentFolder;
export const selectIsLoading = (state: { mail: MailState }) => state.mail.isLoading;
export const selectError = (state: { mail: MailState }) => state.mail.error;
export const selectHasMore = (state: { mail: MailState }) => state.mail.hasMore;
