import { useState, useCallback } from 'react';
import useOnKeyDown from '../../hooks/useOnKeyDown';
import useAuth from './../../hooks/useAuth';

// components
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import UserConversations from './UserConversations';
import NewConversationFriends from './NewConversationFriends';
import Tooltip from '../shared/Tooltip';

// utils
import { KEYCODES } from '../../utils/keycodes';
import MessengerVolumeControls from './MessengerVolumeControls';

// icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function MessengerDropdown({ open, setOpen, anchorRef }) {
  const { currentUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleExpand = useCallback(() => {
    setIsExpanded((prevState) => !prevState);
  }, []);

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
              <Grid container direction="column">
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

                  <Tooltip title={isExpanded ? 'Show less' : 'Show more'}>
                    <IconButton
                      sx={{
                        marginTop: '20px',
                        marginBottom: '10px',
                        marginRight: '10px',
                      }}
                      onClick={handleExpand}>
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Tooltip>

                  <Divider sx={{ width: '100%' }} />
                </Grid>

                <MessengerVolumeControls isShowing={isExpanded} />

                <Grid
                  item
                  xs={12}
                  style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Divider sx={{ width: '100%' }} />

                  {/* MESSENGER DROPDOWN CONTENT */}

                  {currentUser.friends.length > 0 ? (
                    <>
                      <UserConversations closeMenu={handleClose} />
                      <Divider sx={{ width: '100%' }} />
                      <NewConversationFriends />
                    </>
                  ) : (
                    <Typography variant="body2" style={{ padding: '20px' }}>
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
