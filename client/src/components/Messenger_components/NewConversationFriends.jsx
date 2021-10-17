import { useSelector, useDispatch } from 'react-redux';
import useAuth from './../../hooks/useAuth';
import useMessenger from './../../hooks/useMessenger';

// components
import Divider from '@mui/material/Divider';
import Tooltip from '../shared/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

// utils
import makeStyles from '@mui/styles/makeStyles';
import { getRankImage } from '../../utils/getRankImage';

const NewConversationFriends = () => {
  const classes = useStyles();
  const { onlineFriends } = useMessenger();
  const { currentUser } = useAuth();

  return (
    <MenuList>
      {currentUser.friends.map((friendUser, idx, arr) => {
        const isOnline = onlineFriends.includes(friendUser?._id);

        if (!friendUser) return null;

        return (
          <MenuItem onClick={() => {}}>
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
