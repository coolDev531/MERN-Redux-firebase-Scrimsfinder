import { useState, useEffect } from 'react';

// components
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { Modal } from '../shared/ModalComponents';

// icons
import CreateNewConversationButton from '../Messenger_components/CreateNewConversationButton';
import { useSelector, useDispatch } from 'react-redux';
import useAuth from './../../hooks/useAuth';

const ConversationCreateModal = () => {
  const [newMessage, setNewMessage] = useState('');
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const {
    conversationCreateModalOpen: { isOpen = false, receiverUser = null },
  } = useSelector(({ general }) => general);

  const onClose = () =>
    dispatch({ type: 'general/conversationCreateModalClose' });

  useEffect(() => {
    if (!isOpen) {
      setNewMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose} title={`Start a new conversation`}>
      <Grid item container direction="column">
        <Typography variant="body2">
          Start a new conversation with {receiverUser?.name}
        </Typography>
        <OutlinedInput
          multiline
          className="_draggable__input"
          sx={{ marginTop: 4, width: '98%' }} // this width also expands the width of the modal (as wanted tbh)
          placeholder="new message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <CreateNewConversationButton
                currentUser={currentUser}
                receiverUser={receiverUser}
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
