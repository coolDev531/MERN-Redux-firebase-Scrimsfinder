import { Fragment, useCallback, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useAuth from './../../hooks/useAuth';
import useAlerts from './../../hooks/useAlerts';
import useUsers from './../../hooks/useUsers';

// components
import Divider from '@mui/material/Divider';
import Tooltip from '../shared/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { Modal } from '../shared/ModalComponents';

// utils
import makeStyles from '@mui/styles/makeStyles';
import { getRankImage } from '../../utils/getRankImage';

// icons
import CreateIcon from '@mui/icons-material/Create';

// a list of friends that the user doesn't have a conversation with yet.
const NewConversationFriends = () => {
  const classes = useStyles();
  const { allUsers } = useUsers();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { onlineFriends, conversations } = useSelector(
    ({ messenger }) => messenger
  );

  const { currentUser } = useAuth();

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
          <Fragment key={friendUser._id}>
            <MenuItem onClick={() => setIsCreateModalOpen(friendUser._id)}>
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
                    alt={friendUser.rank}
                    width="20px"
                    className={classes.userRank}
                  />
                  {friendUser.name}
                  {idx !== arr.length - 1 ? <Divider /> : null}
                </div>
              </Tooltip>
            </MenuItem>
            <NewConversationModal
              open={isCreateModalOpen === friendUser?._id}
              setOpen={setIsCreateModalOpen}
              receiverUser={friendUser}
              currentUser={currentUser}
            />
          </Fragment>
        );
      })}
    </MenuList>
  );
};

const NewConversationModal = ({ receiverUser, currentUser, open, setOpen }) => {
  const [newMessage, setNewMessage] = useState('');
  const { setCurrentAlert } = useAlerts();

  const onSubmit = useCallback(async () => {
    // send new conversation to api.
    // close the new conversation modal
    // open the chat room modal
    if (!newMessage) {
      setCurrentAlert({
        type: 'Error',
        message: 'cannot start a new conversation: message not provided!',
      });
    }

    try {
      setOpen(false);
    } catch (error) {
      console.error(error);
      setCurrentAlert({
        type: 'Error',
        message: 'error starting a new conversation',
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  useEffect(() => {
    if (!open) {
      console.log('test');
      setNewMessage('');
    }
  }, [open]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title={`Start a new conversation`}>
      <Grid item container direction="column">
        <Typography variant="body2">
          Start a new conversation with with {receiverUser.name}
        </Typography>
        <OutlinedInput
          multiline
          className="_draggable__input"
          minRows={2}
          maxRows={4}
          sx={{ marginTop: 4, width: '98%' }} // this width also expands the width of the modal (as wanted tbh)
          placeholder="new message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <Tooltip title="Start the conversation">
                <IconButton onClick={() => onSubmit(newMessage)}>
                  <CreateIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          }
        />
      </Grid>
    </Modal>
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
