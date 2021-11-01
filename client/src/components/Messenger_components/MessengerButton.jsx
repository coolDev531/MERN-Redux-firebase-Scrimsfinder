import { useRef } from 'react';
import { useSelector } from 'react-redux';

// other
import { makeStyles } from '@mui/styles';

// components
import IconButton from '@mui/material/IconButton';
import Tooltip from '../shared/Tooltip';
import SecondaryTooltip from '@mui/material/Tooltip';

// icons
import MessengerIcon from '@mui/icons-material/Chat';
import MessengerDropdown from './MessengerDropdown';

export default function MessengerButton({
  onClick,
  withDropdown = true,
  isMessengerDropdownOpen,
  setIsMessengerDropdownOpen,
  tooltipTitle = 'Messenger',
  tooltipType = 'primary',
  isScrim = true,
}) {
  const anchorRef = useRef(null);
  const classes = useStyles();
  const { unseenMessages } = useSelector(({ messenger }) => messenger);

  return (
    <>
      <TooltipComponent title={tooltipTitle} tooltipType={tooltipType}>
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
          {/* red circle with unseen messages count */}
          {!isScrim && unseenMessages.length > 0 ? (
            <div className={classes.unseenMessagesCount}>
              {unseenMessages.length}
            </div>
          ) : null}
          <MessengerIcon fontSize="large" />
        </IconButton>
      </TooltipComponent>
      {/* if withDropdown true (is true for navbar messenger button, show the dropdown) */}
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

const TooltipComponent = ({ tooltipType, children, ...rest }) =>
  tooltipType === 'primary' ? (
    <Tooltip {...rest}>{children}</Tooltip>
  ) : (
    <SecondaryTooltip arrow placement="top" {...rest}>
      {children}
    </SecondaryTooltip>
  );

const useStyles = makeStyles({
  unseenMessagesCount: {
    backgroundColor: 'red',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    position: 'absolute',
    top: '0px',
    right: '-5px',
    fontSize: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
