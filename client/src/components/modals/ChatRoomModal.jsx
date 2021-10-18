// hooks
import { useCallback, useState, useEffect, useRef, useMemo, memo } from 'react';
import useAlerts from '../../hooks/useAlerts';
import useUsers from '../../hooks/useUsers';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';
import useSound from 'use-sound';

// components
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import ChatBubble from './../Messenger_components/ChatBubble';

// services
import { getConversationMessages } from '../../services/messages.services';
import { postNewMessage } from '../../services/messages.services';

// icons
import CreateIcon from '@mui/icons-material/Create';
import Tooltip from '../shared/Tooltip';

import NewMessageSFX from '../../assets/sounds/new_message.mp3';

// utils
import makeStyles from '@mui/styles/makeStyles';
import devLog from '../../utils/devLog';
import { Modal } from '../shared/ModalComponents';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

// messenger modal chat room
export default function ChatRoomModal() {
  const { allUsers } = useUsers();
  const { currentUser } = useAuth();
  const { chatRoomOpen } = useSelector(({ general }) => general);

  const { conversation = null, isOpen = false } = chatRoomOpen;
  const dispatch = useDispatch();

  const onClose = () =>
    dispatch({
      type: 'general/closeChatRoom',
    });

  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(''); // the user input field new message to be sent
  const [arrivalMessage, setArrivalMessage] = useState(null); // new message that will be received from socket

  const [playNewMessageSFX] = useSound(NewMessageSFX, {
    volume: 0.25,
  });

  const { socket } = useSocket();

  const conversationMemberIds = useMemo(() => {
    if (!conversation?.members?.length) return;

    return conversation?.members?.map(({ _id }) => _id);
  }, [conversation?.members]);

  const scrollRef = useRef(); // automatically scroll to bottom on new message created.

  const classes = useStyles();

  const { setCurrentAlert } = useAlerts();

  useEffect(() => {
    if (!isOpen) return;
    // take event from server
    socket.current?.on('getMessage', (data) => {
      devLog('getMessage event: ', data);
      setArrivalMessage({
        _sender: allUsers.find((user) => user._id === data.senderId),
        text: data.text,
        createdAt: Date.now(),
        _id: data.messageId,
      });
    });
  }, [allUsers, socket, isOpen]);

  useEffect(() => {
    // fetch messages by conversationId and set in the state.
    const fetchMessages = async () => {
      const messagesData = await getConversationMessages(conversation?._id);
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
  }, [conversation?._id]);

  useEffect(() => {
    // doing this so we don't see this message at conversations that aren't this one

    if (
      arrivalMessage &&
      conversationMemberIds?.includes(arrivalMessage?._sender?._id)
    ) {
      devLog('socket new arrival message added to state (receiver client)');

      playNewMessageSFX();

      setMessages((prevState) => [...prevState, arrivalMessage]);
    }
  }, [arrivalMessage, conversationMemberIds, playNewMessageSFX]);

  const handleSubmitMessage = useCallback(
    async (msgText) => {
      try {
        const newlyCreatedMessage = await postNewMessage({
          senderId: currentUser?._id,
          conversationId: conversation?._id,
          text: msgText,
        });

        const receiver = conversation?.members?.find(
          (user) => user._id !== currentUser?._id
        );

        // send event to server after creating on client and posting to api
        devLog('EMIT'); // emits only once

        socket.current?.emit('sendMessage', {
          senderId: currentUser?._id,
          text: msgText,
          receiverId: receiver?._id,
          messageId: newlyCreatedMessage._id,
          createdAt: newlyCreatedMessage.createdAt,
        });

        setMessages((prevState) => [...prevState, newlyCreatedMessage]);

        setNewMessage('');
      } catch (error) {
        console.log({ error });
        const errorMsg =
          error?.response?.data?.error ??
          'error sending message, try again later';

        setCurrentAlert({
          type: 'Error',
          message: errorMsg,
        });
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser?._id, conversation?._id]
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!isOpen) return;
    if (!scrollRef?.current) return;

    const scroll = scrollRef?.current;
    scroll.scrollTop = scroll?.scrollHeight;

    scroll.animate({ scrollTop: scroll?.scrollHeight }); // automatically scroll to bottom on new message created and mount

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoaded, isOpen]);

  const handleChange = useCallback((e) => setNewMessage(e.target.value), []);

  if (!isOpen) return null;

  return (
    <Modal
      title={`Messenger Chat${
        chatRoomOpen.extraTitle ? ` ${chatRoomOpen.extraTitle}` : ''
      }`}
      customStyles={{}}
      contentClassName={classes.modalContent}
      open={isOpen}
      onClose={onClose}>
      {!isLoaded || !conversation?._id ? (
        <div
          style={{
            padding: '50px',
            margin: '100px 0',
          }}>
          <LinearProgress />
        </div>
      ) : (
        <div
          style={{
            minWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
          }}>
          <div className={classes.chatRoomMessagesContainer} ref={scrollRef}>
            {messages.map((message) => (
              // one message
              <ChatBubble
                isCurrentUser={message._sender._id === currentUser?._id}
                key={message._id}
                messageText={message.text}
                userName={message._sender.name}
                userRank={message._sender.rank}
                messageDate={message.createdAt}
              />
            ))}
          </div>

          <ChatInput
            value={newMessage}
            onChange={handleChange}
            onSubmit={handleSubmitMessage}
          />
        </div>
      )}
    </Modal>
  );
}

const ChatInput = memo(({ value, onChange, onSubmit }) => {
  return (
    <OutlinedInput
      multiline
      className="_draggable__input"
      minRows={2}
      maxRows={4}
      sx={{ marginTop: 4, width: '98%' }} // this width also expands the width of the modal (as wanted tbh)
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
});

const useStyles = makeStyles((theme) => ({
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '300px',
    maxWidth: '600px',
    maxHeight: '100%', // 100% to follow chat bubble overflow instead.
    overflowWrap: 'break-word',
  },

  chatRoomMessagesContainer: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
}));
