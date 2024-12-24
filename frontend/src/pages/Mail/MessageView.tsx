import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AttachFile as AttachmentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

import { Message } from '../../types/mail';

interface MessageViewProps {
  message: Message;
  onClose: () => void;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onDelete: (message: Message) => void;
}

const MessageView: React.FC<MessageViewProps> = ({
  message,
  onClose,
  onReply,
  onForward,
  onDelete
}) => {
  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {message.subject}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="subtitle1">
            From: {message.from.name || message.from.address}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(message.date), 'PPpp')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Typography variant="subtitle1">To:</Typography>
          {message.to.map((recipient, index) => (
            <Chip
              key={index}
              label={recipient.name || recipient.address}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
        {message.cc && message.cc.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Typography variant="subtitle1">Cc:</Typography>
            {message.cc.map((recipient, index) => (
              <Chip
                key={index}
                label={recipient.name || recipient.address}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
        <div dangerouslySetInnerHTML={{ __html: message.body || '' }} />
      </Box>
      {message.attachments && message.attachments.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Attachments
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {message.attachments.map((attachment) => (
                <Chip
                  key={attachment.id}
                  icon={<AttachmentIcon />}
                  label={attachment.name}
                  variant="outlined"
                  onClick={() => {/* Handle attachment download */}}
                />
              ))}
            </Box>
          </Box>
        </>
      )}
      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <Button
          startIcon={<ReplyIcon />}
          variant="contained"
          onClick={() => onReply(message)}
        >
          Reply
        </Button>
        <Button
          startIcon={<ForwardIcon />}
          onClick={() => onForward(message)}
        >
          Forward
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<DeleteIcon />}
          color="error"
          onClick={() => onDelete(message)}
        >
          Delete
        </Button>
      </Box>
    </Paper>
  );
};

export default MessageView;
