import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Fab,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  getMessages,
  selectMessages,
  selectIsLoading,
  selectError,
  selectHasMore,
  selectCurrentFolder
} from '../../store/slices/mailSlice';
import { Message } from '../../types/mail';
import ComposeDialog from './ComposeDialog';

const Mail: React.FC = () => {
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
  
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectMessages);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const hasMore = useAppSelector(selectHasMore);
  const currentFolder = useAppSelector(selectCurrentFolder);
  const theme = useTheme();

  useEffect(() => {
    loadMessages();
  }, [currentFolder]);

  const loadMessages = async () => {
    await dispatch(getMessages({ folder: currentFolder }));
  };

  const handleRefresh = () => {
    loadMessages();
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !isLoading) {
      loadMessages();
    }
  };

  const handleComposeClick = () => {
    setComposeOpen(true);
  };

  const handleComposeClose = () => {
    setComposeOpen(false);
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)}
        </Typography>
        <IconButton onClick={handleRefresh} disabled={isLoading}>
          <RefreshIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: 'background.default',
          p: 2,
        }}
        onScroll={handleScroll}
      >
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              {index > 0 && <Divider />}
              <ListItem
                button
                onClick={() => handleMessageClick(message)}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        component="span"
                        sx={{ fontWeight: message.isRead ? 400 : 600 }}
                      >
                        {message.subject}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ color: 'text.secondary' }}
                      >
                        {message.from.name || message.from.address}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ color: 'text.secondary' }}
                      >
                        {format(new Date(message.date), 'MMM d, h:mm a')}
                      </Typography>
                    </Box>
                  }
                />
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
        aria-label="compose"
        onClick={handleComposeClick}
        sx={{
          position: 'fixed',
          bottom: theme.spacing(3),
          right: theme.spacing(3),
        }}
      >
        <AddIcon />
      </Fab>
      <ComposeDialog open={composeOpen} onClose={handleComposeClose} />
    </Box>
  );
};

export default Mail;
