// components
import Divider from '@mui/material/Divider';
import Tooltip from '../shared/Tooltip';
import MenuItem from '@mui/material/MenuItem';

// services and utils
import makeStyles from '@mui/styles/makeStyles';
import { getRankImage } from '../../utils/getRankImage';

const ChatOnline = ({
  conversations,
  currentUser,
  onlineFriends,
  openChat,
}) => {
  const classes = useStyles();

  return conversations.map((conversation, idx) => {
    const userFriends = currentUser.friends.map(({ _id }) => _id);

    const friendUser = conversation.members.find(({ _id }) =>
      userFriends.includes(_id)
    );

    const isOnline = onlineFriends.includes(friendUser?._id);

    if (!friendUser) return null;

    if (!isOnline) return null;

    return (
      <MenuItem>
        <Tooltip title="Move to conversation" key={friendUser._id}>
          <div className={classes.user} onClick={() => openChat(friendUser)}>
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
            {idx !== conversations.length - 1 ? <Divider /> : null}
          </div>
        </Tooltip>
      </MenuItem>
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

export default ChatOnline;
