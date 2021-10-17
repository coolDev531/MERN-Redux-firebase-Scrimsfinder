import { useCallback } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import UserConversations from '../MessengerModal_components/UserConversations';
import useOnKeyDown from '../../hooks/useOnKeyDown';
import { KEYCODES } from '../../utils/keycodes';

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
              {/* close dropdown when opening a chat */}
              <UserConversations closeMenu={handleClose} />
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
}
