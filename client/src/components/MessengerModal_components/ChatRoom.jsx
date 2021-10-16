import { useCallback, useState, useEffect } from 'react';

import useAuth from '../../hooks/useAuth';
import useAlerts from '../../hooks/useAlerts';

// components
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

// services and utils
import { getConversationMessages } from '../../services/messages.services';
import makeStyles from '@mui/styles/makeStyles';

// icons

import CreateIcon from '@mui/icons-material/Create';
import Tooltip from '../shared/Tooltip';

// messenger modal chat room
export default function ChatRoom({ conversation }) {
  const { currentUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const setCurrentAlert = useAlerts();

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
}

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
