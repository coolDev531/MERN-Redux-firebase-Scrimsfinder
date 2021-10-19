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
import ConversationAlertIcon from '@mui/icons-material/Announcement';

// a list of existing conversations with the users friends
export default function UserConversations({ closeMenu }) {
  const { conversations, onlineFriends, unseenMessages } = useSelector(
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser._id]
  );

  return (
    <MenuList>
      <ExistingConversations
        conversations={conversations}
        currentUser={currentUser}
        onlineFriends={onlineFriends}
        openChat={openChat}
        unseenMessages={unseenMessages}
      />
    </MenuList>
  );
}

const ExistingConversations = memo(
  ({ conversations, currentUser, onlineFriends, openChat, unseenMessages }) => {
    const classes = useStyles();

    // returns the count of unseen messages from that friend user for current user, also returns a boolean for has unseen messages
    const getFriendUnseenMessages = (friendUser) => {
      let unseenMap = {};

      const hasUnseenMessages = unseenMessages.find(({ _sender }) => {
        if (friendUser?._id === _sender) {
          return true;
        } else {
          return false;
        }
      });

      if (!hasUnseenMessages) return [false, 0];

      for (const { _sender } of unseenMessages) {
        if (!unseenMap[_sender]) {
          unseenMap[_sender] = 1;
        } else if (unseenMap[_sender]) {
          unseenMap[_sender] += 1;
        }
      }

      const unseenMessagesCount = unseenMap[friendUser?._id] ?? 0;

      return [hasUnseenMessages, unseenMessagesCount];
    };

    return (
      <>
        {conversations.map((conversation, idx) => {
          const userFriends = currentUser.friends.map(({ _id }) => _id);

          // do it that way to get actual object
          const friendUser = conversation.members.find(({ _id }) =>
            userFriends.includes(_id)
          );

          const isOnline = onlineFriends.includes(friendUser?._id);

          const [hasUnseenMessages, unseenMessagesCount] =
            getFriendUnseenMessages(friendUser);

          if (!friendUser) return null;

          return (
            <MenuItem onClick={() => openChat(friendUser)} key={friendUser._id}>
              {/* ONE CONVERSATION */}
              <Tooltip title="Move to conversation">
                <div className={classes.user}>
                  <div
                    // isOnline handled by socket
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
                    {hasUnseenMessages ? (
                      <div>
                        <div className={classes.unseenMessagesCount}>
                          {unseenMessagesCount}
                        </div>
                        <ConversationAlertIcon />
                      </div>
                    ) : (
                      <MsgIcon />
                    )}
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

  unseenMessagesCount: {
    backgroundColor: 'red',
    borderRadius: '50%',
    width: '15px',
    height: '15px',
    position: 'absolute',
    top: '-3px',
    right: '-10px',
    fontSize: '0.7rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
