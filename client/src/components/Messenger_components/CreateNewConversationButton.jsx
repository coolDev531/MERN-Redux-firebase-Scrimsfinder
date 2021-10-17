// hooks
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useAlerts from '../../hooks/useAlerts';

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
export default function CreateNewConversationButton({
  currentUser,
  receiverUser,
  newMessageText,
  setOpen,
}) {
  const dispatch = useDispatch();
  const { setCurrentAlert } = useAlerts();

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
      // socket.current?.emit('sendConversation', {
      //   senderId: currentUser?._id,
      //   text: msgText,
      //   receiverId: receiver._id,
      //   messageId: newlyCreatedMessage._id,
      //   createdAt: newlyCreatedMessage.createdAt,
      //   conversationId: newConversation._id
      // });

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
