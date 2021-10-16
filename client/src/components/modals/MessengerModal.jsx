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
import useAuth from './../../hooks/useAuth';
import useAlerts from './../../hooks/useAlerts';

// components
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Modal } from './../shared/ModalComponents';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

// services and utils
import { getConversationMessages } from '../../services/messages.services';
import makeStyles from '@mui/styles/makeStyles';

// icons

import CreateIcon from '@mui/icons-material/Create';
import Tooltip from './../shared/Tooltip';

export default function MessengerModal() {
  const [view, setView] = useState('all-conversations'); // all-conversations, chat-room
  const [conversation, setConversation] = useState('');

  const dispatch = useDispatch();
  const [{ conversations }, { messengerOpen }] = useSelector(
    ({ messenger, general }) => [messenger, general]
  );

  const modalTitle = useMemo(
    () => (view === 'chat-room' ? 'Messenger (Chat Room)' : 'Messenger'),
    [view]
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
    <Modal title={modalTitle} open={messengerOpen} onClose={closeMessenger}>
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
  const [loaded, setLoaded] = useState(false);

  const setCurrentAlert = useAlerts();

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

      setLoaded(true);
    };

    fetchMessages();

    // reset on component unmount
    return () => {
      setLoaded(false);
      setMessages([]);
    };
  }, [conversation._id]);

  const handleSubmitMessage = useCallback(
    (msgText) => {
      if (!msgText) {
        setCurrentAlert({
          type: 'Error',
          message: 'cannot send message, input is empty!',
        });
      }

      const newMessage = {
        text: msgText,
        _sender: currentUser,
      };

      return setMessages((prevState) => [...prevState, newMessage]);
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser?._id]
  );

  if (!loaded) {
    return (
      <div>
        <LinearProgress sx={{ width: '100%' }} />
      </div>
    );
  }

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

      <ChatInput onSubmit={handleSubmitMessage} />
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

const ChatInput = ({ onSubmit }) => {
  const [newMessage, setNewMessage] = useState('');

  return (
    <OutlinedInput
      multiline
      rows={2}
      minRows={2}
      maxRows={4}
      sx={{ marginTop: 4, width: '40ch' }} // this width also expands the width of the modal (as wanted tbh)
      placeholder="new message"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      endAdornment={
        <InputAdornment position="end">
          <Tooltip title="Send message">
            <IconButton onClick={() => onSubmit(newMessage)}>
              <CreateIcon />
            </IconButton>
          </Tooltip>
        </InputAdornment>
      }
    />
  );
};
