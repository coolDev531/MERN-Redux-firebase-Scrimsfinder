// hooks
import { useDispatch } from 'react-redux';
import useAlerts from './../../hooks/useAlerts';

// components
import IconButton from '@mui/material/IconButton';

// icons
import CreateIcon from '@mui/icons-material/BorderColor';
import { postNewConversation } from './../../services/conversations.services';

export default function NewConversationButton({ currentUser, receiverUser }) {
  const dispatch = useDispatch();
  const { setCurrentAlert } = useAlerts();

  const handleCreateConversation = async () => {
    try {
      const newConversation = await postNewConversation({
        senderId: currentUser._id,
        receiverId: receiverUser._id,
      });

      dispatch({ type: 'messenger/addNewConversation', newConversation });
    } catch (error) {
      console.error(error);
      setCurrentAlert({
        type: 'Error',
        message: `Error creating new conversation with ${receiverUser.name}`,
      });
    }
  };

  if (!currentUser._id) return null;

  return (
    <IconButton onClick={handleCreateConversation}>
      <CreateIcon fontSize="small" />
    </IconButton>
  );
}
