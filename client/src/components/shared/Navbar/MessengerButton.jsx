import { useRef } from 'react';
import { useSelector } from 'react-redux';
import useSound from 'use-sound';
import useEffectExceptOnMount from './../../../hooks/useEffectExceptOnMount';

// other
import { makeStyles } from '@mui/styles';

// components
import IconButton from '@mui/material/IconButton';
import Tooltip from './../Tooltip';

// icons
import MessengerIcon from '@mui/icons-material/Chat';
import MessengerDropdown from '../../Messenger_components/MessengerDropdown';

// sounds
import NewMessageSFX from '../../../assets/sounds/new_message.mp3';

export default function MessengerButton({
  onClick,
  withDropdown = true,
  isMessengerDropdownOpen,
  setIsMessengerDropdownOpen,
  tooltipTitle = 'Messenger',
  isScrim = true,
}) {
  const anchorRef = useRef(null);
  const classes = useStyles();
  const { unseenMessages } = useSelector(({ messenger }) => messenger);

  return (
    <>
      <MessengerNotificationSound />
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
          {!isScrim && unseenMessages.length > 0 ? (
            <div className={classes.unseenMessagesCount}>
              {unseenMessages.length}
            </div>
          ) : null}
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

const MessengerNotificationSound = () => {
  const [{ playSFX }, { chatRoomOpen }] = useSelector(
    ({ messenger, general }) => [messenger, general]
  );
  const [play] = useSound(NewMessageSFX, { interrupt: true, volume: 0.25 });

  useEffectExceptOnMount(() => {
    if (chatRoomOpen?.isOpen) {
      return;
    }

    play();
  }, [playSFX]);

  return null;
};

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
