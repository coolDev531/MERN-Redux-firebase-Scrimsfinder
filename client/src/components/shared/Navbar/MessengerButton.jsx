import { useRef } from 'react';

import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from './../Tooltip';

// icons
import MessengerIcon from '@mui/icons-material/Chat';
import MessengerDropdown from '../../Messenger_components/MessengerDropdown';

export default function MessengerButton({
  onClick,
  isMessengerDropdownOpen,
  setIsMessengerDropdownOpen,
}) {
  const anchorRef = useRef(null);

  return (
    <Grid item>
      <Tooltip title="Messenger">
        <IconButton
          ref={anchorRef}
          onClick={onClick}
          aria-controls={isMessengerDropdownOpen ? 'messenger-menu' : undefined}
          aria-expanded={isMessengerDropdownOpen ? 'true' : undefined}
          aria-haspopup="true">
          {/* {conversations.length > 0 ? (
            <div className={classes.newMessagesCount}>
            {conversations.length}
            </div>
          ) : null} */}
          <MessengerIcon fontSize="large" />
        </IconButton>
      </Tooltip>
      <MessengerDropdown
        anchorRef={anchorRef}
        open={isMessengerDropdownOpen}
        setOpen={setIsMessengerDropdownOpen}
      />
    </Grid>
  );
}

// const useStyles = makeStyles({
//   newMessagesCount: {
//     backgroundColor: 'red',
//     borderRadius: '50%',
//     width: '24px',
//     height: '24px',
//     position: 'absolute',
//     top: '0px',
//     right: '-5px',
//     fontSize: '1rem',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });
