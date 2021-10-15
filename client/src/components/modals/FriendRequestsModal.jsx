import { memo, useCallback } from 'react';
import useAlerts from './../../hooks/useAlerts';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from '../shared/ModalComponents';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from './../shared/Tooltip';

// utils
import { getRankImage } from './../../utils/getRankImage';

// services
import { addUserFriend, removeFriendRequest } from '../../services/users';

// icons
import CheckIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function FriendRequestsModal() {
  const [{ friendRequestsOpen }, { currentUser }, { allUsers }] = useSelector(
    ({ general, auth, users }) => [general, auth, users]
  );
  const dispatch = useDispatch();
  const { setCurrentAlert } = useAlerts();

  const onClose = () => dispatch({ type: 'general/closeFriendRequests' });

  const friendRequests = currentUser?.friendRequests ?? [];

  const onAcceptClick = useCallback(
    async (requestUser, requestId) => {
      try {
        const { updatedUserFriends } = await addUserFriend(
          currentUser._id,
          requestUser._id
        );

        const { friendRequests } = await removeFriendRequest(
          currentUser._id,
          requestId
        );

        dispatch({
          type: 'auth/updateCurrentUser',
          payload: {
            friends: updatedUserFriends,
            friendRequests,
          },
        });

        setCurrentAlert({
          type: 'Success',
          message: `${requestUser.name} added as a friend!`,
        });
      } catch (error) {
        setCurrentAlert({
          type: 'Error',
          message: error?.response?.data?.error ?? error.message,
        });
      }
    },

    [currentUser._id, dispatch, setCurrentAlert]
  );

  const onRejectClick = useCallback(
    async (requestUser, requestId) => {
      try {
        const { friendRequests } = await removeFriendRequest(
          currentUser._id,
          requestId
        );

        dispatch({
          type: 'auth/updateCurrentUser',
          payload: {
            friendRequests,
          },
        });

        setCurrentAlert({
          type: 'Info',
          message: `rejected ${requestUser.name}'s friend request`,
        });
      } catch (error) {
        setCurrentAlert({
          type: 'Error',
          message: error?.response?.data?.error ?? error.message,
        });
      }
    },

    [currentUser._id, dispatch, setCurrentAlert]
  );

  return (
    <Modal title="Friend Requests" open={friendRequestsOpen} onClose={onClose}>
      {friendRequests.length > 0 ? (
        friendRequests.map((friendRequest) => (
          <OneFriendRequest
            onRejectClick={onRejectClick}
            onAcceptClick={onAcceptClick}
            key={friendRequest._id}
            friendRequest={friendRequest}
            requestUser={allUsers.find(
              ({ _id }) => _id === friendRequest._user
            )}
          />
        ))
      ) : (
        <Typography
          variant="h6"
          textAlign="center"
          style={{ fontSize: '1rem' }}>
          No friend requests found
        </Typography>
      )}
    </Modal>
  );
}

const OneFriendRequest = memo(
  ({ friendRequest, requestUser, onAcceptClick, onRejectClick }) => {
    return (
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item container alignItems="center" xs={6}>
          <img
            src={getRankImage(requestUser)}
            alt={requestUser.rank}
            width="20"
          />
          &nbsp;
          <span>{requestUser.name}</span>
          <span>({requestUser.region})</span>
        </Grid>

        <Grid item>
          <Tooltip title="Accept">
            <IconButton
              onClick={() => onAcceptClick(requestUser, friendRequest._id)}>
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reject">
            <IconButton
              onClick={() => onRejectClick(requestUser, friendRequest._id)}>
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    );
  }
);
