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
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { useAppDispatch, useAppSelector } from '../../store';
import { sendMessage, selectIsLoading, selectError } from '../../store/slices/mailSlice';
import { SendMessageData } from '../../types/mail';

interface ComposeDialogProps {
  open: boolean;
  onClose: () => void;
}

const validationSchema = yup.object({
  to: yup
    .string()
    .email('Enter a valid email')
    .required('Recipient is required'),
  subject: yup
    .string()
    .required('Subject is required'),
  body: yup
    .string()
    .required('Message body is required'),
});

const ComposeDialog: React.FC<ComposeDialogProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const formik = useFormik({
    initialValues: {
      to: '',
      subject: '',
      body: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const messageData: SendMessageData = {
          to: [values.to],
          subject: values.subject,
          body: values.body,
        };
        
        await dispatch(sendMessage(messageData)).unwrap();
        resetForm();
        onClose();
      } catch (err) {
        // Error will be handled by the Redux store
        console.error('Failed to send message:', err);
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
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          Compose Message
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            id="to"
            name="to"
            label="To"
            margin="normal"
            value={formik.values.to}
            onChange={formik.handleChange}
            error={formik.touched.to && Boolean(formik.errors.to)}
            helperText={formik.touched.to && formik.errors.to}
            disabled={isLoading}
          />
          <TextField
            fullWidth
            id="subject"
            name="subject"
            label="Subject"
            margin="normal"
            value={formik.values.subject}
            onChange={formik.handleChange}
            error={formik.touched.subject && Boolean(formik.errors.subject)}
            helperText={formik.touched.subject && formik.errors.subject}
            disabled={isLoading}
          />
          <TextField
            fullWidth
            id="body"
            name="body"
            label="Message"
            margin="normal"
            multiline
            rows={8}
            value={formik.values.body}
            onChange={formik.handleChange}
            error={formik.touched.body && Boolean(formik.errors.body)}
            helperText={formik.touched.body && formik.errors.body}
            disabled={isLoading}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
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
            Send
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ComposeDialog;
