import { useCallback, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useAuth from '../../hooks/useAuth';

// components
import Divider from '@mui/material/Divider';
import Tooltip from '../shared/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

// utils
import makeStyles from '@mui/styles/makeStyles';
import { getRankImage } from '../../utils/getRankImage';
import { truncate } from './../../utils/truncate';

// services
import { findOneConversation } from '../../services/conversations.services';

// icons
import MsgIcon from '@mui/icons-material/Sms';

// a list of existing conversations with the users friends
export default function UserConversations({ closeMenu }) {
  const { conversations, onlineFriends } = useSelector(
    ({ messenger }) => messenger
  );

  const dispatch = useDispatch();

  const { currentUser } = useAuth();

  const openChat = useCallback(
    async (user) => {
      try {
        // find conversation from api
        const conversation = await findOneConversation(
          currentUser._id,
          user._id
        );

        // open the chat room modal in the redux store with the conversation object
        dispatch({
          type: 'general/chatRoomOpen',
          payload: { conversation, isOpen: true },
        });
        closeMenu();
      } catch (error) {
        throw error;
      }
    },
    [currentUser._id]
  );

  return (
    <MenuList>
      <ExistingConversations
        conversations={conversations}
        currentUser={currentUser}
        onlineFriends={onlineFriends}
        openChat={openChat}
      />
    </MenuList>
  );
}

const ExistingConversations = memo(
  ({ conversations, currentUser, onlineFriends, openChat }) => {
    const classes = useStyles();

    return (
      <>
        {conversations.map((conversation, idx) => {
          const userFriends = currentUser.friends.map(({ _id }) => _id);

          const friendUser = conversation.members.find(({ _id }) =>
            userFriends.includes(_id)
          );

          const isOnline = onlineFriends.includes(friendUser?._id);

          if (!friendUser) return null;

          return (
            <MenuItem onClick={() => openChat(friendUser)}>
              <Tooltip title="Move to conversation" key={friendUser._id}>
                <div className={classes.user}>
                  <div
                    // add this bool to user (use socket?) if onlien green, else red
                    style={{
                      backgroundColor: isOnline ? '#AAFF00' : '#EE4B2B',
                    }}
                    className={classes.isOnlineCircle}></div>
                  <img
                    src={getRankImage(friendUser)}
                    alt={friendUser?.rank}
                    width="20px"
                    className={classes.userRank}
                  />
                  {truncate(friendUser.name, 12)}

                  <div style={{ position: 'absolute', right: '0', top: '0' }}>
                    <MsgIcon />
                  </div>
                  {idx !== conversations.length - 1 ? <Divider /> : null}
                </div>
              </Tooltip>
            </MenuItem>
          );
        })}
      </>
    );
  }
);

const useStyles = makeStyles({
  user: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    width: '100%',
  },

  userRank: {
    marginRight: '10px',
  },

  isOnlineCircle: {
    marginRight: '10px',
    borderRadius: '50%',
    height: '10px',
    width: '10px',
  },
});
