import { useCallback, useState } from 'react';
import useOnKeyDown from '../../hooks/useOnKeyDown';
import { useSelector } from 'react-redux';

// components
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '../shared/Tooltip';
import UserConversations from './UserConversations';
import NewConversationFriends from './NewConversationFriends';

// utils
import { KEYCODES } from '../../utils/keycodes';

// icons
import CreateIcon from '@mui/icons-material/Create';
import ForumIcon from '@mui/icons-material/Forum';

export default function MessengerDropdown({ open, setOpen, anchorRef }) {
  const { conversations } = useSelector(({ messenger }) => messenger);

  const [view, setView] = useState(() => {
    return conversations.length > 0 ? 'existing' : 'create-new';
  });

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useOnKeyDown(9, (e) => {
    e.preventDefault();
    setOpen(false);
  });

  useOnKeyDown(
    KEYCODES.ESCAPE,
    (e) => {
      console.log('27');
      if (open) {
        setOpen(false);
      }
    },
    [open]
  );

  return (
    <Popper
      style={{ zIndex: '2000', width: '250px' }}
      open={open}
      anchorEl={anchorRef.current}
      role={undefined}
      placement="bottom-start"
      transition
      disablePortal>
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin:
              placement === 'bottom-start' ? 'left top' : 'left bottom',
          }}>
          <Paper>
            <ClickAwayListener onClickAway={handleClose}>
              <Grid container xs={12} direction="column">
                <Grid
                  item
                  container
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between">
                  {/* MESSENGER DROPDOWN TITLE */}
                  <Typography
                    sx={{
                      marginLeft: '20px',
                      marginTop: '20px',
                      marginBottom: '10px',
                    }}
                    component="h1"
                    gutterBottom
                    variant="h6">
                    Messenger
                  </Typography>

                  <Grid
                    item
                    style={{ marginRight: '-10px' }}
                    container
                    alignItems="center"
                    xs={3}>
                    {view === 'create-new' ? (
                      <Tooltip title="View existing conversations">
                        <IconButton onClick={() => setView('existing')}>
                          <ForumIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Start a new conversation">
                        <IconButton onClick={() => setView('create-new')}>
                          <CreateIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>

                  <Divider sx={{ width: '100%' }} />
                </Grid>

                <Grid item xs={12}>
                  {/* MESSENGER DROPDOWN SUBTITLE */}
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{
                      marginLeft: '20px',
                      marginTop: '10px',
                      marginBottom: '10px',
                    }}>
                    {view === 'existing'
                      ? 'Existing conversations'
                      : 'Start a new conversation'}
                  </Typography>
                  <Divider />

                  {/* MESSENGER DROPDOWN CONTENT */}
                  {view === 'existing' ? (
                    <UserConversations closeMenu={handleClose} /> // close menu will close the drop down after opening a chat room in that component
                  ) : (
                    <NewConversationFriends />
                  )}
                </Grid>
              </Grid>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
}
