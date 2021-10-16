// hooks
import { useCallback, useState, useEffect, useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import useAlerts from '../../hooks/useAlerts';

// components
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

// services and utils
import { getConversationMessages } from '../../services/messages.services';
import { postNewMessage } from './../../services/messages.services';
import makeStyles from '@mui/styles/makeStyles';

// icons
import CreateIcon from '@mui/icons-material/Create';
import Tooltip from '../shared/Tooltip';
import { useLayoutEffect } from 'react';

// messenger modal chat room
export default function ChatRoom({ conversation }) {
  const { currentUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const scrollRef = useRef(); // automatically scroll to bottom on new message created.
  const div = useRef();

  const { setCurrentAlert } = useAlerts();

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

      setIsLoaded(true);
    };

    fetchMessages();

    // reset on component unmount
    return () => {
      setIsLoaded(false);
      setMessages([]);
    };
  }, [conversation._id]);

  const handleSubmitMessage = useCallback(
    async (msgText) => {
      if (!msgText) {
        setCurrentAlert({
          type: 'Error',
          message: 'cannot send message, input value is empty!',
        });
      }

      const newlyCreatedMessage = await postNewMessage({
        senderId: currentUser?._id,
        conversationId: conversation._id,
        text: msgText,
      });

      setMessages((prevState) => [...prevState, newlyCreatedMessage]);

      setNewMessage('');
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser?._id]
  );

  const onChange = useCallback((e) => setNewMessage(e.target.value), []);

  useLayoutEffect(() => {
    if (!isLoaded) return;

    const scroll = scrollRef?.current;
    scroll.scrollTop = scroll?.scrollHeight;

    scroll.animate({ scrollTop: scroll?.scrollHeight }); // automatically scroll to bottom on new message created and mount
  }, [messages, isLoaded]);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '300px', minWidth: '350px' }}>
        <LinearProgress />
      </div>
    );
  }

  return (
    <div>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }} ref={scrollRef}>
        {messages.map((message) => (
          // one message
          <ChatBubble
            isCurrentUser={message._sender._id === currentUser._id}
            key={message._id}
            messageText={message.text}
            userName={message._sender.name}
            scrollRef={scrollRef} // automatically scroll to bottom on new message created, ref is passed to container div
          />
        ))}
      </div>

      <div>
        <ChatInput
          value={newMessage}
          onChange={onChange}
          onSubmit={handleSubmitMessage}
        />
      </div>
    </div>
  );
}

// one message
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

const ChatInput = ({ value, onChange, onSubmit }) => {
  return (
    <OutlinedInput
      multiline
      minRows={2}
      maxRows={4}
      sx={{ marginTop: 4, width: '40ch' }} // this width also expands the width of the modal (as wanted tbh)
      placeholder="new message"
      value={value}
      onChange={onChange}
      endAdornment={
        <InputAdornment position="end">
          <Tooltip title="Send message">
            <IconButton onClick={() => onSubmit(value)}>
              <CreateIcon />
            </IconButton>
          </Tooltip>
        </InputAdornment>
      }
    />
  );
};

const useStyles = makeStyles({
  bubbleContainer: {
    width: '100%',
    display: 'flex',
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
