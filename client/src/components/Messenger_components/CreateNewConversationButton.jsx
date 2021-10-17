// hooks
import { useCallback } from 'react';
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
import { pushUserNotification } from '../../services/users.services';

// CreateNewConversation button
export default function CreateNewConversationButton({
  currentUser,
  receiverUser,
  newMessageText,
  setOpen,
}) {
  const dispatch = useDispatch();
  const { setCurrentAlert } = useAlerts();

  const { socket } = useSocket();

  const handleCreateConversation = useCallback(async () => {
    try {
      // create the conversation
      const newConversation = await postNewConversation({
        senderId: currentUser._id,
        receiverId: receiverUser._id,
      });

      devLog('new conversation created! ', newConversation);
      // add the initial messsage;

      const newlyCreatedMessage = await postNewMessage({
        senderId: currentUser?._id,
        conversationId: newConversation._id,
        text: newMessageText,
      });

      devLog('new message added to the conversation!', newlyCreatedMessage);

      socket.current?.emit('sendConversation', {
        senderId: currentUser?._id,
        receiverId: receiverUser._id,
        conversationId: newConversation._id,
      });

      const newNotification = {
        message: `${currentUser.name} has started a conversation with you on messenger!`,
        _relatedUser: currentUser._id,
        createdDate: Date.now(),
        receiverId: receiverUser._id,
        conversation: newConversation,
        isConversationStart: true,
      };

      // send notification to user who received the conversation
      socket.current?.emit('sendNotification', newNotification);

      // send to back end
      const createdNotification = await pushUserNotification(
        currentUser._id,
        newNotification
      );

      devLog({ createdNotification });

      dispatch({
        type: 'messenger/addNewConversation',
        payload: newConversation,
      });

      setOpen(false);

      setTimeout(() => {
        dispatch({
          type: 'general/chatRoomOpen',
          payload: { conversation: newConversation, isOpen: true },
        });
      }, 1);
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
    currentUser.name,
    socket,
    dispatch,
    setCurrentAlert,
    setOpen,
    newMessageText,
  ]);

  if (!currentUser._id) return null;

  return (
    <Tooltip title="Start the conversation">
      <IconButton onClick={handleCreateConversation}>
        <CreateIcon />
      </IconButton>
    </Tooltip>
  );
}
