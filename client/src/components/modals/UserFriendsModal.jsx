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
import { getUserFriends } from '../../services/friends.services';
import { findOneConversation } from '../../services/conversations.services';

// icons
import CreateConversationIcon from '@mui/icons-material/Create';
import MsgIcon from '@mui/icons-material/Sms';

function UserFriendsModal() {
  const [
    {
      friendsModalOpen: { user, bool },
    },
    { currentUser },
  ] = useSelector(({ general, auth }) => [general, auth]);

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
        // weird nested populate thing...
        friends?.map(({ _id: friend }, idx, arr) => (
          <Fragment key={friend?._id}>
            <OneFriend
              key={friend?._id}
              user={user}
              currentUser={currentUser}
              onClose={onClose}
              friend={friend}
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
  const [conversation, setConversation] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchConversation = async () => {
      if (user._id !== currentUser._id) return; // don't fetch conversation if it's not the own user's friends modal open
      const oneConversation = await findOneConversation(
        currentUser._id,
        friend._id
      );
      setConversation(oneConversation ?? null);
    };
    fetchConversation();
  }, [currentUser._id, friend._id, user._id]);

  // this means that these users have an existing conversation
  const existingConversation =
    currentUser?._id !== user?._id ? false : conversation?._id;

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
            <span>{friend.name}</span>&nbsp;
            <span>({friend.region})</span>
          </Link>
        </Tooltip>
      </Grid>

      {user?._id === currentUser?._id && (
        <Grid item container direction="row" alignItems="center" xs={2}>
          <Tooltip
            title={
              existingConversation
                ? `Send ${friend.name} a message`
                : `Start a new conversation`
            }>
            <IconButton
              onClick={() => {
                if (existingConversation) {
                  dispatch({
                    type: 'general/chatRoomOpen',
                    payload: { isOpen: true, conversation: conversation },
                  });
                } else {
                  dispatch({
                    type: 'general/conversationCreateModalOpen',
                    payload: {
                      isOpen: true,
                      receiverUser: friend,
                    },
                  });
                }
              }}>
              {existingConversation ? <MsgIcon /> : <CreateConversationIcon />}
            </IconButton>
          </Tooltip>
        </Grid>
      )}
    </Grid>
  );
});

export default memo(UserFriendsModal); // this will rerender if not using memo
