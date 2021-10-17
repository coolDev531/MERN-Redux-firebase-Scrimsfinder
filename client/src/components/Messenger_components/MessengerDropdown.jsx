import { useCallback } from 'react';
import useOnKeyDown from '../../hooks/useOnKeyDown';

// components
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import UserConversations from './UserConversations';

// utils
import { KEYCODES } from '../../utils/keycodes';
import NewConversationFriends from './NewConversationFriends';

export default function MessengerDropdown({ open, setOpen, anchorRef }) {
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
                  <Typography
                    sx={{ marginLeft: '20px', marginTop: '20px' }}
                    component="h1"
                    variant="h6">
                    Messenger
                  </Typography>

                  <Grid item xs={12}>
                    <NewConversationFriends />
                  </Grid>
                </Grid>

                {/* close dropdown when opening a chat */}
                <Grid item xs={12}>
                  <UserConversations closeMenu={handleClose} />
                </Grid>
              </Grid>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
}
