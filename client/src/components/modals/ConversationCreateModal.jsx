import { useCallback, useState, useEffect } from 'react';
import useAlerts from '../../hooks/useAlerts';

// components
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { Modal } from '../shared/ModalComponents';

// icons
import CreateNewConversationButton from '../Messenger_components/CreateNewConversationButton';

// exists inside NewConversationFriends.jsx
const ConversationCreateModal = ({
  receiverUser,
  currentUser,
  open,
  setOpen,
}) => {
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setNewMessage('');
    }
  }, [open]);

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
              <CreateNewConversationButton
                currentUser={currentUser}
                receiverUser={receiverUser}
                setOpen={setOpen}
                newMessageText={newMessage}
              />
            </InputAdornment>
          }
        />
      </Grid>
    </Modal>
  );
};

export default ConversationCreateModal;
