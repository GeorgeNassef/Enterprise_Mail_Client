import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  ListItemButton,
  Collapse
} from '@mui/material';
import {
  Mail as MailIcon,
  Event as EventIcon,
  Contacts as ContactsIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Drafts as DraftsIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mailOpen, setMailOpen] = React.useState(true);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleMailClick = () => {
    setMailOpen(!mailOpen);
  };

  return (
    <Box sx={{ overflow: 'auto' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Navigation
        </Typography>
      </Box>
      <Divider />
      <List>
        {/* Mail Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleMailClick}>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Mail" />
            {mailOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={mailOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive('/')}
              onClick={() => handleNavigation('/')}
            >
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Inbox" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive('/sent')}
              onClick={() => handleNavigation('/sent')}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Sent" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive('/drafts')}
              onClick={() => handleNavigation('/drafts')}
            >
              <ListItemIcon>
                <DraftsIcon />
              </ListItemIcon>
              <ListItemText primary="Drafts" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive('/trash')}
              onClick={() => handleNavigation('/trash')}
            >
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary="Trash" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Calendar Section */}
        <ListItemButton
          selected={isActive('/calendar')}
          onClick={() => handleNavigation('/calendar')}
        >
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="Calendar" />
        </ListItemButton>

        {/* Contacts Section */}
        <ListItemButton
          selected={isActive('/contacts')}
          onClick={() => handleNavigation('/contacts')}
        >
          <ListItemIcon>
            <ContactsIcon />
          </ListItemIcon>
          <ListItemText primary="Contacts" />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Sidebar;
