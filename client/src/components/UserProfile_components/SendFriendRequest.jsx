import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useAlerts from './../../hooks/useAlerts';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import useSocket from './../../hooks/useSocket';

// components
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';
import DeleteFriendButton from './DeleteFriendButton';

// services
import {
  sendFriendRequest,
  checkFriendRequestSent,
} from '../../services/friends.services';

// utils
import devLog from './../../utils/devLog';

// icons
import AddFriendIcon from '@mui/icons-material/AddReaction';

export default function SendFriendRequest({ user, setUser }) {
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // loading friend request status (sent or not)
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
        message: `${currentUser.name} sent you a friend request!`,
        isFriendRequest: true,
        createdDate: Date.now(),
        createdAt: Date.now(),
        receiverId: user?._id,
      };

      // send notification to user who received the frind request
      socket?.emit('sendNotification', newNotification);

      devLog('sent friend request', newFriendRequest);

      setRequestSent({ newFriendRequest });

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

  useEffect(() => {
    const checkIsRequestSent = async () => {
      if (!user?._id) return;
      try {
        setIsLoading(true);
        setRequestSent(await checkFriendRequestSent(user?._id));
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    checkIsRequestSent();
  }, [user?._id]);

  const isFriend = useMemo(() => {
    return user.friends.find((friend) => friend._id === currentUser._id)
      ? true
      : false;
  }, [user.friends, currentUser._id]);

  return (
    <FormGroup
      row
      style={{
        opacity: isLoading ? 0 : 1,
        userSelect: isLoading ? 'none' : 'inherit',
        transition: 'all 250ms ease-in-out',
      }}>
      {/* if not friend, show send friend request button */}
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
      ) : (
        // else show delete button (unfriend)
        <DeleteFriendButton
          friendToDelete={user}
          currentUser={currentUser}
          setFriend={setUser}
        />
      )}
    </FormGroup>
  );
}
