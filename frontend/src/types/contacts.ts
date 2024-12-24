export interface PhoneNumber {
  type: 'business' | 'home' | 'mobile';
  number: string;
}

export interface Address {
  type: 'business' | 'home' | 'other';
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Contact {
  id: string;
  givenName?: string;
  surname?: string;
  displayName: string;
  emailAddresses: string[];
  phoneNumbers?: PhoneNumber[];
  addresses?: Address[];
  companyName?: string;
  jobTitle?: string;
  department?: string;
  notes?: string;
  createdTime: string;
  modifiedTime: string;
}

export interface ContactsState {
  contacts: Contact[];
  selectedContact: Contact | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  pageToken: string | null;
  hasMore: boolean;
}

export interface GetContactsParams {
  searchQuery?: string;
  pageSize?: number;
  pageToken?: string;
  folderId?: string;
}

export interface CreateContactData {
  givenName?: string;
  surname?: string;
  displayName: string;
  emailAddresses: string[];
  phoneNumbers?: PhoneNumber[];
  addresses?: Address[];
  companyName?: string;
  jobTitle?: string;
  department?: string;
  notes?: string;
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  nextPageToken: string | null;
}

export interface ContactFolder {
  id: string;
  name: string;
  parentFolderId?: string;
  childFolders?: ContactFolder[];
}

export type ContactSort = 'displayName' | 'companyName' | 'createdTime' | 'modifiedTime';
export type SortDirection = 'asc' | 'desc';

export interface ContactFilters {
  company?: string;
  department?: string;
  hasPhoneNumber?: boolean;
  hasEmailAddress?: boolean;
  modifiedAfter?: string;
  modifiedBefore?: string;
}
