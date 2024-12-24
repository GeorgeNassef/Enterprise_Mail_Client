export interface EmailAddress {
  address: string;
  name?: string;
}

export interface Attachment {
  id: string;
  name: string;
  contentType: string;
  size: number;
}

export interface Message {
  id: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  date: string;
  body?: string;
  hasAttachments: boolean;
  attachments?: Attachment[];
  preview?: string;
}

export interface MailState {
  messages: Message[];
  selectedMessage: Message | null;
  isLoading: boolean;
  error: string | null;
  pageToken: string | null;
  hasMore: boolean;
  currentFolder: string;
}

export interface GetMessagesParams {
  folder?: string;
  pageSize?: number;
  pageToken?: string;
  search?: string;
}

export interface SendMessageData {
  subject: string;
  body: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: File[];
}

export interface MessageResponse {
  messages: Message[];
  nextPageToken: string | null;
}

export interface MailFolder {
  id: string;
  name: string;
  unreadCount?: number;
  totalCount?: number;
  childFolders?: MailFolder[];
}

export type MessageSort = 'date' | 'subject' | 'from';
export type SortDirection = 'asc' | 'desc';

export interface MailFilters {
  hasAttachment?: boolean;
  from?: string;
  to?: string;
  subject?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
