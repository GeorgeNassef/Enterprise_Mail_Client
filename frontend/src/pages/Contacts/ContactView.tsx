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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AccountTree as DepartmentIcon
} from '@mui/icons-material';

import { useAppDispatch } from '../../store';
import { deleteContact } from '../../store/slices/contactsSlice';
import { Contact } from '../../types/contacts';

interface ContactViewProps {
  contact: Contact;
  onClose: () => void;
  onEdit: () => void;
}

const ContactView: React.FC<ContactViewProps> = ({
  contact,
  onClose,
  onEdit
}) => {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deleteContact(contact.id)).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
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
            {contact.displayName}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Name Section */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              {contact.givenName} {contact.surname}
            </Typography>
          </Box>

          {/* Email Addresses */}
          {contact.emailAddresses.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Email Addresses
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {contact.emailAddresses.map((email, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon color="action" fontSize="small" />
                    <Typography>{email}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Phone Numbers */}
          {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Phone Numbers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {contact.phoneNumbers.map((phone, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="action" fontSize="small" />
                    <Typography>
                      {phone.number}{' '}
                      <Typography component="span" color="text.secondary">
                        ({phone.type})
                      </Typography>
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Divider />

          {/* Work Information */}
          {(contact.companyName || contact.jobTitle || contact.department) && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Work Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {contact.companyName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="action" fontSize="small" />
                    <Typography>{contact.companyName}</Typography>
                  </Box>
                )}
                {contact.jobTitle && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon color="action" fontSize="small" />
                    <Typography>{contact.jobTitle}</Typography>
                  </Box>
                )}
                {contact.department && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DepartmentIcon color="action" fontSize="small" />
                    <Typography>{contact.department}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Notes */}
          {contact.notes && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {contact.notes}
              </Typography>
            </Box>
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
          onClick={onEdit}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactView;
