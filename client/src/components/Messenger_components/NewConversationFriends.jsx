import { useSelector } from 'react-redux';
import useAuth from './../../hooks/useAuth';
import useUsers from './../../hooks/useUsers';
import { useDispatch } from 'react-redux';

// components
import Divider from '@mui/material/Divider';
import Tooltip from '../shared/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

// utils
import makeStyles from '@mui/styles/makeStyles';
import { getRankImage } from '../../utils/getRankImage';
import { truncate } from './../../utils/truncate';

import CreateIcon from '@mui/icons-material/Create';

// a list of friends that the user doesn't have a conversation with yet. (on messenger dropdown)
const NewConversationFriends = () => {
  const classes = useStyles();
  const { allUsers } = useUsers();

  const { onlineFriends, conversations } = useSelector(
    ({ messenger }) => messenger
  );

  const dispatch = useDispatch();

  const openCreateModal = (receiverUser) =>
    dispatch({
      type: 'general/conversationCreateModalOpen',
      payload: { isOpen: true, receiverUser },
    });

  const { currentUser } = useAuth();

  const getFriendUserId = (arr) => {
    const friend = arr.find(({ _id }) => _id !== currentUser?._id);
    return friend?._id;
  };

  return (
    <MenuList>
      {currentUser.friends.map(({ _id: friendId }, idx, arr) => {
        const friendUser = allUsers.find((user) => user?._id === friendId); // not populated on back-end

        const isOnline = onlineFriends.includes(friendUser?._id);

        const memberIds = conversations.flatMap(({ members }) =>
          getFriendUserId(members)
        );

        const inConversation = memberIds.includes(friendUser?._id);
        // if the user is already in a conversation with current user, we don't want him to show
        // in the new convos screen.
        if (inConversation) return null;

        return (
          <MenuItem
            onClick={() => openCreateModal(friendUser)}
            key={friendUser?._id}>
            <Tooltip title="Start a new conversation">
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
                  <CreateIcon />
                </div>

                {idx !== arr.length - 1 ? <Divider /> : null}
              </div>
            </Tooltip>
          </MenuItem>
        );
      })}
    </MenuList>
  );
};

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

export default NewConversationFriends;
