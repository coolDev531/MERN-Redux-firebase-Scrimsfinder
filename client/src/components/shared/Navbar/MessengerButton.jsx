import { useRef } from 'react';

import IconButton from '@mui/material/IconButton';
import Tooltip from './../Tooltip';

// icons
import MessengerIcon from '@mui/icons-material/Chat';
import MessengerDropdown from '../../Messenger_components/MessengerDropdown';

export default function MessengerButton({
  onClick,
  withDropdown = true,
  isMessengerDropdownOpen,
  setIsMessengerDropdownOpen,
  tooltipTitle = 'Messenger',
}) {
  const anchorRef = useRef(null);

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <IconButton
          ref={anchorRef}
          onClick={onClick}
          aria-controls={
            withDropdown && isMessengerDropdownOpen
              ? 'messenger-menu'
              : undefined
          }
          aria-expanded={
            withDropdown && isMessengerDropdownOpen ? 'true' : undefined
          }
          aria-haspopup={withDropdown && 'true'}>
          <MessengerIcon fontSize="large" />
        </IconButton>
      </Tooltip>
      {withDropdown && (
        <MessengerDropdown
          anchorRef={anchorRef}
          open={isMessengerDropdownOpen}
          setOpen={setIsMessengerDropdownOpen}
        />
      )}
    </>
  );
}
