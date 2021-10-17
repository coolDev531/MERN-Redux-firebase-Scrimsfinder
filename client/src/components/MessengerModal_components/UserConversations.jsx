import { memo, useState, useEffect } from 'react';

// components
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet';
import Tooltip from '../shared/Tooltip';

// services and utils
import makeStyles from '@mui/styles/makeStyles';
import { getRankImage } from './../../utils/getRankImage';

const UserConversations = ({
  conversations,
  changeToView,
  onlineUsers,
  currentUser,
}) => {
  const classes = useStyles();

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Messenger: Conversations | Bootcamp LoL Scrim Gym</title>
      </Helmet>

      <Box
        component="ul"
        display="flex"
        flexDirection="column"
        style={{ maxHeight: '300px' }}>
        <ExistingConversations
          conversations={conversations}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          changeToView={changeToView}
        />
      </Box>
    </>
  );
};

const ExistingConversations = ({
  conversations,
  currentUser,
  onlineUsers,
  changeToView,
}) => {
  const classes = useStyles();

  return conversations.map((conversation, idx) => {
    const userFriends = currentUser.friends.map(({ _id }) => _id);

    const friendUser = conversation.members.find(({ _id }) =>
      userFriends.includes(_id)
    );

    const isOnline = onlineUsers.includes(friendUser?._id);

    if (!friendUser) return null;

    return (
      <Tooltip title="Move to conversation" key={friendUser._id}>
        <div
          className={classes.user}
          onClick={() => changeToView('chat-room', conversation)}>
          <div
            // add this bool to user (use socket?) if onlien green, else red
            style={{ backgroundColor: isOnline ? '#AAFF00' : '#EE4B2B' }}
            className={classes.isOnlineCircle}></div>
          {friendUser.name}
          <img
            src={getRankImage(friendUser)}
            alt={friendUser.rank}
            width="20px"
          />
          {idx !== conversations.length - 1 ? <Divider /> : null}
        </div>
      </Tooltip>
    );
  });
};

const useStyles = makeStyles({
  user: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    width: 'fit-content',
  },

  isOnlineCircle: {
    position: 'absolute',
    top: '5px',
    left: '-20px',
    borderRadius: '50%',
    height: '10px',
    width: '10px',
  },
});
export default UserConversations;
