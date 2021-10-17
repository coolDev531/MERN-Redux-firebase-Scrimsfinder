import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useAlerts from './../../hooks/useAlerts';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import useSocket from './../../hooks/useSocket';

// components
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';

// services
import { sendFriendRequest } from '../../services/users.services';

// utils
import devLog from './../../utils/devLog';

// icons
import AddFriendIcon from '@mui/icons-material/AddReaction';

export default function SendFriendRequest({ user, setUser }) {
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const { currentUser } = useSelector(({ auth }) => auth);
  const { setCurrentAlert } = useAlerts();
  const { socket } = useSocket();
  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.up('sm'));

  const onSubmitFriendRequest = async () => {
    setButtonsDisabled(true);

    try {
      const { newFriendRequest } = await sendFriendRequest(
        user._id,
        currentUser._id
      ); // current user sending to that user in the profile page.

      //  add a new notification to the user
      const newNotification = {
        _relatedUser: currentUser._id,
        message: `${currentUser._id} sent you a friend request!`,
        isFriendRequest: true,
        createdDate: Date.now(),
        createdAt: Date.now(),
        receiverId: user?._id,
      };

      // send notification to user who received the frind request
      socket.current?.emit('sendNotification', newNotification);

      setUser((prevState) => ({
        ...prevState,
        friendRequests: [...prevState.friendRequests, newFriendRequest],
      }));

      devLog('sent friend request', newFriendRequest);

      setCurrentAlert({
        type: 'Success',
        message: `Friend request sent to ${user.name}!`,
      });

      setButtonsDisabled(false);
    } catch (error) {
      setCurrentAlert({
        type: 'Error',
        message: 'Error sending friend request',
      });

      setButtonsDisabled(false);
      throw error;
    }
  };

  const requestSent = useMemo(() => {
    return user.friendRequests.find(
      (request) => request?._user === currentUser?._id
    )
      ? true
      : false;
  }, [currentUser?._id, user?.friendRequests]);

  const isFriend = useMemo(() => {
    return user.friends.find((friend) => friend._id === currentUser._id)
      ? true
      : false;
  }, [user.friends, currentUser._id]);

  return (
    <FormGroup row>
      {!isFriend ? (
        <Button
          style={{
            height: '50px',
            alignSelf: 'center',
            marginLeft: !matchesSm ? '0' : '20px',
            marginTop: '20px',
          }}
          startIcon={<AddFriendIcon />}
          variant="contained"
          disabled={buttonsDisabled || requestSent}
          onClick={onSubmitFriendRequest}>
          {requestSent ? 'Friend Request Sent' : 'Send Friend Request'}
        </Button>
      ) : null}
    </FormGroup>
  );
}
