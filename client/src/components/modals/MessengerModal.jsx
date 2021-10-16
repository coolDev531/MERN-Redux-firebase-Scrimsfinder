import {
  memo,
  Fragment,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useUsers from './../../hooks/useUsers';

// components
import Typography from '@mui/material/Typography';

import { Modal } from './../shared/ModalComponents';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

// services
import { getConversationMessages } from '../../services/messages.services';

export default function MessengerModal() {
  const [view, setView] = useState('all-conversations'); // all-conversations, chat-room
  const [conversationId, setConversationId] = useState('');

  const dispatch = useDispatch();
  const [{ conversations }, { messengerOpen }] = useSelector(
    ({ messenger, general }) => [messenger, general]
  );

  const closeMessenger = useCallback(() => {
    dispatch({ type: 'general/closeMessenger' });
  }, [dispatch]);

  const changeToView = useCallback((value, conversationId) => {
    if (value === 'chat-room') {
      setConversationId(conversationId);

      setTimeout(() => {
        setView('chat-room');
      }, 100);
      // activate socket for chat or w/e
      // fetch the messages.
    } else {
      setView(value);
    }
  }, []);

  return (
    <Modal title="Messenger" open={messengerOpen} onClose={closeMessenger}>
      <button onClick={() => changeToView('all-conversations')}>
        all convos
      </button>

      {view === 'chat-room' ? (
        <ChatRoom conversationId={conversationId} />
      ) : (
        <AllConversations
          changeToView={changeToView}
          conversations={conversations}
        />
      )}
    </Modal>
  );
}

const AllConversations = memo(({ conversations, changeToView }) => (
  <>
    <Box component="ul" display="flex" flexDirection="column">
      {conversations.map((conversation) => (
        <pre onClick={() => changeToView('chat-room', conversation._id)}>
          {JSON.stringify(conversation, null, 2)}{' '}
        </pre>
      ))}
    </Box>
  </>
));

const ChatRoom = ({ conversationId }) => {
  // const { allUsers } = useUsers();

  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState({
    currentUser: '',
    friendUser: '',
  });

  useEffect(() => {
    // fetch messages by conversationId and set in the state.
    const fetchMessages = async () => {
      const messagesData = await getConversationMessages(conversationId);
      setMessages(messagesData);
    };

    fetchMessages();

    // reset on component unmount
    return () => {
      setMessages([]);
      setMembers({});
    };
  }, [conversationId]);

  return <>{conversationId}</>;
};
