import { Fragment, memo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useAlerts from './../../hooks/useAlerts';

// components
import { Modal } from '../shared/ModalComponents';
import Tooltip from '../shared/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

// utils
import { getRankImage } from './../../utils/getRankImage';

// services
import { removeUserFriend } from './../../services/users';

// icons
import CancelIcon from '@mui/icons-material/Cancel';

export default function UserFriendsModal() {
  const [
    {
      friendsModalOpen: { friends, user, bool },
    },
    { allUsers },
    { currentUser },
  ] = useSelector(({ general, users, auth }) => [general, users, auth]);

  const dispatch = useDispatch();

  const { setCurrentAlert } = useAlerts();

  const onClose = useCallback(() => {
    dispatch({ type: 'general/closeFriendsModal' });
  }, [dispatch]);

  const onDeleteFriend = useCallback(
    async (friendToDelete) => {
      let yes = window.confirm(
        `Are you sure you want to unfriend ${friendToDelete.name}?`
      );

      if (!yes) return;

      try {
        const { userFriends } = await removeUserFriend(
          currentUser?._id,
          friendToDelete._id
        );

        // update the state in the modal as well
        dispatch({
          type: 'auth/updateCurrentUser',
          payload: {
            friends: userFriends,
          },
        });

        dispatch({
          type: 'general/openFriendsModal',
          payload: {
            user: currentUser,
            friends: userFriends,
          },
        });

        setCurrentAlert({
          type: 'Success',
          message: `Unfriended ${friendToDelete.name}`,
        });
      } catch (error) {
        setCurrentAlert({
          type: 'Error',
          message: `error Unfriending ${friendToDelete.name}`,
        });
      }
    },
    [dispatch, currentUser, setCurrentAlert]
  );

  if (!user) return null;
  if (!friends) return null;

  return (
    <Modal title={`${user?.name}'s Friends`} open={bool} onClose={onClose}>
      {friends?.length > 0 ? (
        friends?.map((friend, idx, arr) => (
          <Fragment key={friend?._id}>
            <OneFriend
              key={friend?._id}
              user={user}
              currentUser={currentUser}
              onClose={onClose}
              onDeleteFriend={onDeleteFriend}
              friend={allUsers.find(({ _id }) => _id === friend?._id)}
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
          No friends found
        </Typography>
      )}
    </Modal>
  );
}

const OneFriend = memo(
  ({ friend, onClose, user, currentUser, onDeleteFriend }) => {
    return (
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item container alignItems="center" xs={10}>
          <Tooltip title={`Visit ${friend.name}'s profile`}>
            <Link
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={onClose}
              className="link"
              to={`/users/${friend.name}?region=${friend.region}`}>
              <img src={getRankImage(friend)} alt={friend.rank} width="20" />
              &nbsp;
              <span>{friend.name}</span>
              <span>({friend.region})</span>
            </Link>
          </Tooltip>
        </Grid>

        {user?._id === currentUser?._id && (
          <Grid item container alignItems="center" xs={2}>
            <Tooltip title={`Unfriend ${friend.name}`}>
              <IconButton onClick={() => onDeleteFriend(friend)}>
                <CancelIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Grid>
        )}
      </Grid>
    );
  }
);
