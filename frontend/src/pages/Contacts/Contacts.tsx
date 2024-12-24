import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  InputAdornment,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  getContacts,
  selectContacts,
  selectIsLoading,
  selectError,
  selectHasMore,
  setSearchQuery,
  selectSearchQuery
} from '../../store/slices/contactsSlice';
import { Contact } from '../../types/contacts';
import ContactDialog from './ContactDialog';
import ContactView from './ContactView';

const Contacts: React.FC = () => {
  const [createContactOpen, setCreateContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  
  const dispatch = useAppDispatch();
  const contacts = useAppSelector(selectContacts);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const hasMore = useAppSelector(selectHasMore);
  const searchQuery = useAppSelector(selectSearchQuery);
  const theme = useTheme();

  useEffect(() => {
    loadContacts();
  }, [searchQuery]);

  const loadContacts = async () => {
    await dispatch(getContacts({
      searchQuery,
      pageSize: 50
    }));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(event.target.value));
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !isLoading) {
      loadContacts();
    }
  };

  const handleCreateContact = () => {
    setCreateContactOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditContact(contact);
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleCloseDialog = () => {
    setCreateContactOpen(false);
    setEditContact(null);
  };

  const handleCloseView = () => {
    setSelectedContact(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          mt: 2,
        }}
        onScroll={handleScroll}
      >
        <List>
          {contacts.map((contact, index) => (
            <React.Fragment key={contact.id}>
              {index > 0 && <Divider />}
              <ListItem
                button
                onClick={() => handleViewContact(contact)}
              >
                <ListItemText
                  primary={contact.displayName}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {contact.emailAddresses[0] && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {contact.emailAddresses[0]}
                          </Typography>
                        </Box>
                      )}
                      {contact.phoneNumbers?.[0] && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {contact.phoneNumbers[0].number}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditContact(contact);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
      <Fab
        color="primary"
        aria-label="add contact"
        onClick={handleCreateContact}
        sx={{
          position: 'fixed',
          bottom: theme.spacing(3),
          right: theme.spacing(3),
        }}
      >
        <AddIcon />
      </Fab>
      <ContactDialog
        open={createContactOpen || editContact !== null}
        onClose={handleCloseDialog}
        contact={editContact}
      />
      {selectedContact && (
        <ContactView
          contact={selectedContact}
          onClose={handleCloseView}
          onEdit={() => handleEditContact(selectedContact)}
        />
      )}
    </Box>
  );
};

export default Contacts;
