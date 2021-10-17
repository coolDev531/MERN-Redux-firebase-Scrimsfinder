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
import UserConversations from './UserConversations';
import NewConversationFriends from './NewConversationFriends';

// utils
import { KEYCODES } from '../../utils/keycodes';

export default function MessengerDropdown({ open, setOpen, anchorRef }) {
  const { conversations } = useSelector(({ messenger }) => messenger);

  const [view, setView] = useState(() => {
    return conversations.length > 0 ? 'existing' : 'new';
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
                  justifyContent="space-between">
                  <Grid item xs={12}>
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

                    <Divider />
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
              </Grid>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
}
