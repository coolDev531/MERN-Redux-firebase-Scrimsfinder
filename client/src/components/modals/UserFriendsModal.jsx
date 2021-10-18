import { Fragment, memo, useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

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
import { getUserFriends } from '../../services/users.services';

// icons
// import CancelIcon from '@mui/icons-material/Cancel';
import CreateIcon from '@mui/icons-material/Create';
import MsgIcon from '@mui/icons-material/Sms';

export default function UserFriendsModal() {
  const [
    {
      friendsModalOpen: { user, bool },
    },
    { allUsers },
    { currentUser },
  ] = useSelector(({ general, users, auth }) => [general, users, auth]);

  const [friends, setFriends] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!bool) return;
    const fetchUserFriends = async () => {
      const userFriends = await getUserFriends(user?._id);
      setFriends(userFriends);
    };
    fetchUserFriends();

    return () => {
      setFriends([]);
    };
  }, [user?._id, bool]);

  const onClose = useCallback(() => {
    dispatch({ type: 'general/closeFriendsModal' });
  }, [dispatch]);

  if (!user) return null;
  if (!friends) return null;

  return (
    <Modal
      customStyles={{
        maxWidth: '500px',
        minWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        overflowWrap: 'break-word',
        maxHeight: '300px',
      }}
      title={`${user?.name}'s Friends`}
      open={bool}
      onClose={onClose}>
      {friends?.length > 0 ? (
        friends?.map((friend, idx, arr) => (
          <Fragment key={friend?._id}>
            <OneFriend
              key={friend?._id}
              user={user}
              currentUser={currentUser}
              onClose={onClose}
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

const OneFriend = memo(({ friend, onClose, user, currentUser }) => {
  const { conversations } = useSelector(({ messenger }) => messenger);

  const getFriendUserId = (arr) => {
    let friend = arr.find(({ _id }) => _id !== currentUser?._id);
    return friend?._id;
  };

  const memberIds = conversations.flatMap(({ members }) =>
    getFriendUserId(members)
  );

  const inConversation =
    currentUser?._id !== user?._id ? false : memberIds.includes(friend._id);

  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <Grid item container alignItems="center" xs={6}>
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
        <Grid item container direction="row" alignItems="center" xs={2}>
          <Tooltip
            title={
              inConversation
                ? `Send ${friend.name} a message`
                : `Start a new conversation`
            }>
            <IconButton>
              {inConversation ? <CreateIcon /> : <MsgIcon />}
            </IconButton>
          </Tooltip>
        </Grid>
      )}
    </Grid>
  );
});
