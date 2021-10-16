import { Fragment, memo, useCallback } from 'react';
import useAlerts from './../../hooks/useAlerts';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from '../shared/ModalComponents';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from './../shared/Tooltip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';

// utils
import { getRankImage } from './../../utils/getRankImage';

// services
import {
  addUserFriend,
  pushUserNotification,
  removeFriendRequest,
} from '../../services/users.services';

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
          currentUser?._id,
          requestUser._id
        );

        const { friendRequests } = await removeFriendRequest(
          currentUser?._id,
          requestId
        );

        // send notification to user who requested the friend request
        await pushUserNotification(requestUser._id, {
          message: `You and ${currentUser?.name} are now friends!`,
          _relatedUser: currentUser,
          createdDate: Date.now(),
        });

        // send notification to user that they're friends
        const { notifications } = await pushUserNotification(currentUser._id, {
          message: `You and ${requestUser?.name} are now friends!`,
          _relatedUser: requestUser,
          createdDate: Date.now(),
        });

        dispatch({
          type: 'auth/updateCurrentUser',
          payload: {
            friends: updatedUserFriends,
            friendRequests,
            notifications,
          },
        });

        setCurrentAlert({
          type: 'Success',
          message: `${requestUser.name} added as a friend!`,
        });
      } catch (error) {
        if (error?.response?.data?.error === 'Friend already added!') {
          const { friendRequests } = await removeFriendRequest(
            currentUser?._id,
            requestId
          );

          dispatch({
            type: 'auth/updateCurrentUser',
            payload: {
              friendRequests,
            },
          });
        }

        setCurrentAlert({
          type: 'Error',
          message: error?.response?.data?.error ?? error.message,
        });
      }
    },

    [currentUser, dispatch, setCurrentAlert]
  );

  const onRejectClick = useCallback(
    async (requestUser, requestId) => {
      try {
        const { friendRequests } = await removeFriendRequest(
          currentUser?._id,
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

    [currentUser?._id, dispatch, setCurrentAlert]
  );

  return (
    <Modal title="Friend Requests" open={friendRequestsOpen} onClose={onClose}>
      {friendRequests.length > 0 ? (
        friendRequests.map((friendRequest, idx, arr) => (
          <Fragment key={friendRequest._id}>
            <OneFriendRequest
              onRejectClick={onRejectClick}
              onAcceptClick={onAcceptClick}
              onClose={onClose}
              friendRequest={friendRequest}
              requestUser={allUsers.find(
                ({ _id }) => _id === friendRequest._user
              )}
            />

            {idx !== arr.length - 1 ? (
              <Box my={2}>
                <Divider />
              </Box>
            ) : null}
          </Fragment>
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
  ({ friendRequest, requestUser, onAcceptClick, onRejectClick, onClose }) => {
    return (
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item container alignItems="center" xs={8}>
          <Tooltip title={`Visit ${requestUser.name}'s profile`}>
            <Link
              // close modal because we are redirecting to a path
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center' }}
              className="link"
              to={`/users/${requestUser.name}?region=${requestUser.region}`}>
              <img
                src={getRankImage(requestUser)}
                alt={requestUser.rank}
                width="20"
              />
              &nbsp;
              <span>{requestUser.name}</span>&nbsp;
              <span>({requestUser.region})</span>
            </Link>
          </Tooltip>
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
