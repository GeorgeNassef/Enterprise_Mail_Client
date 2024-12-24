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
  CircularProgress,
  Alert,
  Typography,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { useFormik, FieldArray } from 'formik';
import * as yup from 'yup';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  createContact,
  updateContact,
  selectIsLoading,
  selectError
} from '../../store/slices/contactsSlice';
import { Contact, CreateContactData, PhoneNumber } from '../../types/contacts';

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  contact?: Contact;
}

const validationSchema = yup.object({
  displayName: yup
    .string()
    .required('Display name is required'),
  emailAddresses: yup
    .array()
    .of(yup.string().email('Invalid email address'))
    .min(1, 'At least one email address is required'),
  phoneNumbers: yup
    .array()
    .of(
      yup.object({
        type: yup.string().required('Phone type is required'),
        number: yup.string().required('Phone number is required')
      })
    ),
});

const ContactDialog: React.FC<ContactDialogProps> = ({
  open,
  onClose,
  contact
}) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const formik = useFormik({
    initialValues: {
      displayName: contact?.displayName || '',
      givenName: contact?.givenName || '',
      surname: contact?.surname || '',
      emailAddresses: contact?.emailAddresses || [''],
      phoneNumbers: contact?.phoneNumbers || [],
      companyName: contact?.companyName || '',
      jobTitle: contact?.jobTitle || '',
      department: contact?.department || '',
      notes: contact?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (contact) {
          await dispatch(updateContact({
            id: contact.id,
            ...values,
          })).unwrap();
        } else {
          await dispatch(createContact(values)).unwrap();
        }
        handleClose();
      } catch (err) {
        // Error will be handled by the Redux store
        console.error('Failed to save contact:', err);
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
          {contact ? 'Edit Contact' : 'Create Contact'}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                id="givenName"
                name="givenName"
                label="First Name"
                value={formik.values.givenName}
                onChange={formik.handleChange}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                id="surname"
                name="surname"
                label="Last Name"
                value={formik.values.surname}
                onChange={formik.handleChange}
                disabled={isLoading}
              />
            </Box>
            <TextField
              fullWidth
              id="displayName"
              name="displayName"
              label="Display Name"
              value={formik.values.displayName}
              onChange={formik.handleChange}
              error={formik.touched.displayName && Boolean(formik.errors.displayName)}
              helperText={formik.touched.displayName && formik.errors.displayName}
              disabled={isLoading}
            />
            
            <Typography variant="subtitle2">Email Addresses</Typography>
            <FieldArray
              name="emailAddresses"
              render={arrayHelpers => (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {formik.values.emailAddresses.map((email, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        name={`emailAddresses.${index}`}
                        label={`Email ${index + 1}`}
                        value={email}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.emailAddresses?.[index] &&
                          Boolean(formik.errors.emailAddresses?.[index])
                        }
                        helperText={
                          formik.touched.emailAddresses?.[index] &&
                          formik.errors.emailAddresses?.[index]
                        }
                        disabled={isLoading}
                      />
                      {index > 0 && (
                        <IconButton
                          onClick={() => arrayHelpers.remove(index)}
                          disabled={isLoading}
                        >
                          <RemoveIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => arrayHelpers.push('')}
                    disabled={isLoading}
                  >
                    Add Email
                  </Button>
                </Box>
              )}
            />

            <Typography variant="subtitle2">Phone Numbers</Typography>
            <FieldArray
              name="phoneNumbers"
              render={arrayHelpers => (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {formik.values.phoneNumbers.map((phone, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        select
                        SelectProps={{ native: true }}
                        name={`phoneNumbers.${index}.type`}
                        label="Type"
                        value={phone.type}
                        onChange={formik.handleChange}
                        disabled={isLoading}
                        sx={{ width: 120 }}
                      >
                        <option value="mobile">Mobile</option>
                        <option value="home">Home</option>
                        <option value="business">Business</option>
                      </TextField>
                      <TextField
                        fullWidth
                        name={`phoneNumbers.${index}.number`}
                        label="Number"
                        value={phone.number}
                        onChange={formik.handleChange}
                        disabled={isLoading}
                      />
                      <IconButton
                        onClick={() => arrayHelpers.remove(index)}
                        disabled={isLoading}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => arrayHelpers.push({ type: 'mobile', number: '' })}
                    disabled={isLoading}
                  >
                    Add Phone
                  </Button>
                </Box>
              )}
            />

            <Divider sx={{ my: 1 }} />

            <TextField
              fullWidth
              id="companyName"
              name="companyName"
              label="Company"
              value={formik.values.companyName}
              onChange={formik.handleChange}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="jobTitle"
              name="jobTitle"
              label="Job Title"
              value={formik.values.jobTitle}
              onChange={formik.handleChange}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="department"
              name="department"
              label="Department"
              value={formik.values.department}
              onChange={formik.handleChange}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="notes"
              name="notes"
              label="Notes"
              multiline
              rows={3}
              value={formik.values.notes}
              onChange={formik.handleChange}
              disabled={isLoading}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
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
            {contact ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactDialog;
