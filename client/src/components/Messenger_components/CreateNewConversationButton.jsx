// hooks
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useAlerts from '../../hooks/useAlerts';
import useSocket from './../../hooks/useSocket';

// components
import IconButton from '@mui/material/IconButton';
import Tooltip from '../shared/Tooltip';

// icons
import CreateIcon from '@mui/icons-material/BorderColor';

// utils
import devLog from '../../utils/devLog';

// services
import { postNewConversation } from '../../services/conversations.services';
import { postNewMessage } from '../../services/messages.services';

// CreateNewConversation button
// is inside ConversationCreateModal
export default function CreateNewConversationButton({
  currentUser,
  receiverUser,
  newMessageText,
}) {
  const dispatch = useDispatch();
  const { setCurrentAlert } = useAlerts();

  const { socket } = useSocket();

  const handleCreateConversation = useCallback(async () => {
    try {
      if (!newMessageText) {
        setCurrentAlert({
          type: 'Error',
          message: 'cannot start conversation, no message provided!',
        });
        return;
      }

      // create the conversation
      const newConversation = await postNewConversation({
        senderId: currentUser._id,
        receiverId: receiverUser._id,
      });

      devLog('new conversation created! ', newConversation);
      // add the initial messsage;

      const newlyCreatedMessage = await postNewMessage({
        conversationId: newConversation._id,
        text: newMessageText,
        receiverId: receiverUser._id,
      });

      devLog('new message added to the conversation!', newlyCreatedMessage);

      socket?.emit('sendConversation', {
        senderId: currentUser?._id,
        receiverId: receiverUser._id,
        conversationId: newConversation._id,
      });

      // send event to server after creating on client and posting to api
      devLog('EMIT'); // emits only once

      // send to receiver user that he got new message
      socket?.emit('sendMessage', {
        senderId: currentUser?._id,
        text: newlyCreatedMessage.text,
        receiverId: newlyCreatedMessage._receiver,
        messageId: newlyCreatedMessage._id,
        createdAt: newlyCreatedMessage.createdAt,
        _conversation: newlyCreatedMessage._conversation,
      });

      dispatch({
        type: 'messenger/addNewConversation',
        payload: newConversation,
      });

      dispatch({ type: 'general/conversationCreateModalClose' });

      setTimeout(() => {
        dispatch({
          type: 'general/chatRoomOpen',
          payload: { conversation: newConversation, isOpen: true },
        });
      }, 1);

      setCurrentAlert({
        type: 'Success',
        message: `started a new conversation with ${receiverUser.name}`,
      });
      return;
    } catch (error) {
      console.error(error);
      setCurrentAlert({
        type: 'Error',
        message: `Error creating new conversation with ${receiverUser.name}`,
      });
    }
  }, [
    currentUser._id,
    receiverUser._id,
    receiverUser.name,
    socket,
    dispatch,
    setCurrentAlert,
    newMessageText,
  ]);

  useEffect(() => {
    const handleUserKeyPress = (e) => {
      let shiftKeyPressed = e.shiftKey;
      if (e.key !== 'Enter') return;
      if (!e.target.value) {
        e.preventDefault();
        return;
      }
      // if key is enter and shift isn't pressed submit, else enter a new line
      if (!shiftKeyPressed) {
        handleCreateConversation();
        return;
      }
    };

    window.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [handleCreateConversation]);

  if (!currentUser._id) return null;

  return (
    <Tooltip title="Start the conversation">
      <IconButton onClick={handleCreateConversation}>
        <CreateIcon />
      </IconButton>
    </Tooltip>
  );
}
