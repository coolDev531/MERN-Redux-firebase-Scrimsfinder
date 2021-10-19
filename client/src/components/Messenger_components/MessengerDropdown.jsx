import { useCallback } from 'react';
import useOnKeyDown from '../../hooks/useOnKeyDown';
import useAuth from './../../hooks/useAuth';

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
  const { currentUser } = useAuth();

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

                  <Divider sx={{ width: '100%' }} />
                </Grid>

                <Grid
                  item
                  xs={12}
                  style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Divider sx={{ width: '100%' }} />

                  {/* MESSENGER DROPDOWN CONTENT */}

                  {currentUser.friends.length > 0 ? (
                    <>
                      <UserConversations closeMenu={handleClose} />
                      <Divider sx={{ width: '100%' }} />
                      <NewConversationFriends />
                    </>
                  ) : (
                    <Typography variant="body2" style={{ padding: '10px' }}>
                      No Friends found
                    </Typography>
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
