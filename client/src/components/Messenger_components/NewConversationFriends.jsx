import { useSelector, useDispatch } from 'react-redux';
import useAuth from './../../hooks/useAuth';
import useUsers from './../../hooks/useUsers';

// components
import Divider from '@mui/material/Divider';
import Tooltip from '../shared/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

// utils
import makeStyles from '@mui/styles/makeStyles';
import { getRankImage } from '../../utils/getRankImage';
import { useHistory } from 'react-router-dom';

// a list of friends that the user doesn't have a conversation with yet.
const NewConversationFriends = () => {
  const classes = useStyles();
  const { allUsers } = useUsers();

  const { onlineFriends, conversations } = useSelector(
    ({ messenger }) => messenger
  );

  const { currentUser } = useAuth();
  const history = useHistory();

  const getFriendUserId = (arr) => {
    let friend = arr.find(({ _id }) => _id !== currentUser._id);
    return friend._id;
  };

  return (
    <MenuList>
      {currentUser.friends.map(({ _id: friendId }, idx, arr) => {
        const friendUser = allUsers.find((user) => user._id === friendId); // not populated on back-end

        const isOnline = onlineFriends.includes(friendUser?._id);

        const memberIds = conversations.flatMap(({ members }) =>
          getFriendUserId(members)
        );

        const inConversation = memberIds.includes(friendUser._id);

        // if the user is already in a conversation with current user, we don't want him to show
        // in the new convos screen.
        if (inConversation) return null;

        return (
          <MenuItem
            onClick={() => {
              history.push(
                `/users/${friendUser.name}?region${friendUser.region}`
              );
            }}>
            <Tooltip title="Move to conversation" key={friendUser._id}>
              <div className={classes.user}>
                <div
                  // add this bool to user (use socket?) if onlien green, else red
                  style={{ backgroundColor: isOnline ? '#AAFF00' : '#EE4B2B' }}
                  className={classes.isOnlineCircle}></div>
                <img
                  src={getRankImage(friendUser)}
                  alt={friendUser.rank}
                  width="20px"
                  className={classes.userRank}
                />
                {friendUser.name}
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
    width: 'fit-content',
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
