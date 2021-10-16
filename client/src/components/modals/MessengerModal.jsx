import {
  memo,
  Fragment,
  useCallback,
  useState,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useUsers from './../../hooks/useUsers';

// components
import Typography from '@mui/material/Typography';

import { Modal } from './../shared/ModalComponents';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import useAuth from './../../hooks/useAuth';

// services and utils
import { getConversationMessages } from '../../services/messages.services';
import makeStyles from '@mui/styles/makeStyles';

export default function MessengerModal() {
  const [view, setView] = useState('all-conversations'); // all-conversations, chat-room
  const [conversation, setConversation] = useState('');

  const dispatch = useDispatch();
  const [{ conversations }, { messengerOpen }] = useSelector(
    ({ messenger, general }) => [messenger, general]
  );

  const closeMessenger = useCallback(() => {
    dispatch({ type: 'general/closeMessenger' });
  }, [dispatch]);

  const changeToView = useCallback((value, conversation) => {
    if (value === 'chat-room') {
      setConversation(conversation);

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
        <ChatRoom conversation={conversation} />
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
        <pre
          key={conversation._id}
          onClick={() => changeToView('chat-room', conversation)}>
          {JSON.stringify(conversation, null, 2)}
        </pre>
      ))}
    </Box>
  </>
));

const ChatRoom = ({ conversation }) => {
  const { currentUser } = useAuth();

  const [messages, setMessages] = useState([]);

  const members = useMemo(() => {
    const currentUserIndex = conversation.members.findIndex(
      ({ _id }) => _id === currentUser._id
    );

    const friendUserIndex = currentUserIndex === 0 ? 1 : 0;

    return {
      currentUser: conversation.members[currentUserIndex],
      friendUser: conversation.members[friendUserIndex],
    };
  }, [conversation.members, currentUser._id]);

  useEffect(() => {
    // fetch messages by conversationId and set in the state.
    const fetchMessages = async () => {
      const messagesData = await getConversationMessages(conversation._id);
      setMessages(
        messagesData.sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        })
      );
    };

    fetchMessages();

    // reset on component unmount
    return () => {
      setMessages([]);
    };
  }, [conversation._id]);

  return (
    <div>
      {messages.map((message) => (
        <ChatBubble
          isCurrentUser={message._sender._id === currentUser._id}
          key={message._id}
          messageText={message.text}
          userName={message._sender.name}
        />
      ))}
    </div>
  );
};

const useStyles = makeStyles({
  bubbleContainer: {
    width: '100%',
    display: 'flex', //new added flex so we can put div at left and right side
    //check style.css for left and right classnaeme based on your data
    justifyContent: ({ isCurrentUser }) =>
      isCurrentUser ? 'flex-end' : 'flex-start',
  },

  bubble: {
    border: '0.5px solid black',
    borderRadius: '10px',
    margin: '5px',
    padding: '10px',
    display: 'inline-block',
    color: ({ isCurrentUser }) => (isCurrentUser ? 'white' : 'black'),
    backgroundColor: ({ isCurrentUser }) => (isCurrentUser ? 'blue' : 'white'),
  },
});

const ChatBubble = ({ isCurrentUser, messageText, userName }) => {
  const classes = useStyles({ isCurrentUser });

  return (
    <div className={classes.bubbleContainer}>
      <div className={classes.bubble}>
        <div className={classes.button}>{messageText}</div>
      </div>
    </div>
  );
};
