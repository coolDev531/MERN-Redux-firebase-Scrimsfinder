// hooks
import { useCallback, useState, useEffect, useRef } from 'react';
import useAlerts from '../../hooks/useAlerts';
import useUsers from '../../hooks/useUsers';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';
import useSound from 'use-sound';
import { useSelector, useDispatch } from 'react-redux';
import { useScrimChat } from '../../hooks/useMessenger';

// components
import LinearProgress from '@mui/material/LinearProgress';
import ChatBubble from './../Messenger_components/ChatBubble';
import ChatInput from './../Messenger_components/ChatInput';
import { Modal } from '../shared/ModalComponents';

// services
import { getConversationMessages } from '../../services/messages.services';
import { postNewMessage } from '../../services/messages.services';

// sfx
import NewMessageSFX from '../../assets/sounds/new_message.mp3';

// utils
import makeStyles from '@mui/styles/makeStyles';
import devLog from '../../utils/devLog';

// messenger modal chat room
export default function ScrimChatRoomModal() {
  const { allUsers } = useUsers();
  const { currentUser } = useAuth();
  const [{ scrimChatRoomOpen }, { msgNotificationVolume }] = useSelector(
    ({ general, messenger }) => [general, messenger]
  );

  const { conversation, isOpen: open, scrimId, extraTitle } = scrimChatRoomOpen;

  const dispatch = useDispatch();

  const onClose = () =>
    dispatch({
      type: 'general/closeScrimChatRoom',
    });

  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(''); // the user input field new message to be sent
  const [arrivalMessage, setArrivalMessage] = useState(null); // new message that will be received from socket

  useScrimChat(open, scrimId, currentUser._id);

  const [playNewMessageSFX] = useSound(NewMessageSFX, {
    interrupt: true,
    volume: Number(msgNotificationVolume / 100),
  });

  const { socket } = useSocket();

  const scrollRef = useRef(); // automatically scroll to bottom on new message created.

  const classes = useStyles();

  const { setCurrentAlert } = useAlerts();

  useEffect(() => {
    if (!open) return;
    // take event from server
    socket?.on('getScrimMessage', (data) => {
      devLog('getScrimMessage event: ', data);
      setArrivalMessage({
        _sender: allUsers.find((user) => user._id === data.senderId),
        text: data.text,
        createdAt: Date.now(),
        _id: data.messageId,
        _conversation: data._conversation,
      });
    });
  }, [allUsers, socket, open]);

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
    return () => {
      // eslint-disable-next-line
      socket?.emit('scrimChatClose', {
        userId: currentUser._id,
        scrimId,
      });
    };
  }, [socket, currentUser._id, scrimId]);

  useEffect(() => {
    // doing this so we don't see this message at conversations that aren't this one

    // push to ui and play sound if it's not currentUser id (all other users)
    if (arrivalMessage && arrivalMessage._sender._id !== currentUser._id) {
      // people will have multiple scrim conversation chat boxes open
      // if we dont have this if statement it'll send the message to all open socket scrim chats...
      if (arrivalMessage._conversation !== conversation._id) return;
      devLog('socket new arrival message added to state (receiver client)');

      playNewMessageSFX(); // do we want to play this new message SFX in the scrim chat room? It might confuse users that they got a private message

      setMessages((prevState) => [...prevState, arrivalMessage]);
    }
  }, [arrivalMessage, playNewMessageSFX, currentUser._id, conversation._id]);

  const handleSubmitMessage = useCallback(
    async (msgText) => {
      try {
        const newlyCreatedMessage = await postNewMessage({
          senderId: currentUser?._id,
          conversationId: conversation?._id,
          text: msgText,
        });

        // send event to server after creating on client and posting to api
        devLog('EMIT'); // emits only once

        socket?.emit('sendScrimMessage', {
          senderId: currentUser?._id,
          text: msgText,
          messageId: newlyCreatedMessage._id,
          createdAt: newlyCreatedMessage.createdAt,
          _conversation: conversation._id,
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
    if (!open) return;
    if (!scrollRef?.current) return;

    const scroll = scrollRef?.current;
    scroll.scrollTop = scroll?.scrollHeight;

    scroll.animate({ scrollTop: scroll?.scrollHeight }); // automatically scroll to bottom on new message created and mount

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoaded, open]);

  const handleChange = useCallback((e) => setNewMessage(e.target.value), []);

  if (!open) return null;

  return (
    <Modal
      title={`${extraTitle} |  Chat`}
      customStyles={{}}
      contentClassName={classes.modalContent}
      open={open}
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
