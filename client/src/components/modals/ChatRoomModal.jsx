// hooks
import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import useAlerts from '../../hooks/useAlerts';
import useUsers from '../../hooks/useUsers';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';

// components
import LinearProgress from '@mui/material/LinearProgress';
import ChatBubble from './../Messenger_components/ChatBubble';
import ChatInput from './../Messenger_components/ChatInput';

// services
import { getConversationMessages } from '../../services/messages.services';
import { postNewMessage } from '../../services/messages.services';

// utils
import makeStyles from '@mui/styles/makeStyles';
import devLog from '../../utils/devLog';
import { Modal } from '../shared/ModalComponents';

// service
import { postMessageSeenByUser } from './../../services/messages.services';

// messenger modal chat room
// the chat room between 2 friends (NOT THE SCRIM CHAT ROOM).
export default function ChatRoomModal() {
  const { allUsers } = useUsers();
  const { currentUser } = useAuth();
  const { chatRoomOpen } = useSelector(({ general }) => general);

  const { conversation, isOpen } = chatRoomOpen;

  const dispatch = useDispatch();

  const onClose = () =>
    dispatch({
      type: 'general/closeChatRoom',
    });

  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(''); // the user input field new message to be sent
  const [arrivalMessage, setArrivalMessage] = useState(null); // new message that will be received from socket

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
    socket?.on('getMessage', async (data) => {
      devLog('getMessage event: ', data);

      setArrivalMessage({
        _sender: allUsers.find((user) => user._id === data._sender),
        text: data.text,
        createdAt: Date.now(),
        _id: data.messageId,
        _seenBy: [data._sender, data._receiver],
        _conversation: data._conversation,
        _receiver: data._receiver,
        messageId: data.messageId,
        receiverId: data._receiver,
      });
    });
  }, [allUsers, socket, isOpen]);

  useEffect(() => {
    // fetch messages by conversationId and set in the state.
    const fetchMessages = async () => {
      let messagesData = await getConversationMessages(conversation?._id);

      const newSeenMessages = [];
      const restMessages = [];

      for await (const currentMessage of messagesData) {
        if (!currentMessage?._seenBy?.includes(currentUser?._id)) {
          devLog('message not seen, pushing to DB (now seen)');
          await postMessageSeenByUser(currentMessage._id);

          newSeenMessages.push({
            ...currentMessage,
            _seenBy: [...currentMessage?._seenBy, currentUser?._id],
          });
        } else {
          restMessages.push(currentMessage);
        }
      }

      // only send id's so it's easier to filter
      dispatch({
        type: 'messenger/removeUnseenMessages',
        payload: newSeenMessages.map(({ _id }) => _id),
      });

      const messagesState = [...restMessages, ...newSeenMessages];

      setMessages(
        messagesState.sort((a, b) => {
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?._id, currentUser?._id]);

  useEffect(() => {
    // doing this so we don't see this message at conversations that aren't this one

    const onNewMessageArrival = async () => {
      if (
        arrivalMessage &&
        conversationMemberIds?.includes(arrivalMessage?._sender?._id)
      ) {
        devLog('socket new arrival message added to state (receiver client)');

        if (arrivalMessage._receiver === currentUser._id) {
          // put in the DB that the message has been seen.
          await postMessageSeenByUser(arrivalMessage.messageId);

          dispatch({
            type: 'messenger/messageSeen',
            payload: arrivalMessage._id,
          });
        }

        setMessages((prevState) => [...prevState, arrivalMessage]);

        setArrivalMessage(null);
      }
    };

    onNewMessageArrival();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrivalMessage, conversationMemberIds, currentUser?._id]);

  const handleSubmitMessage = useCallback(
    async (msgText) => {
      try {
        const receiver = conversation?.members?.find(
          (user) => user._id !== currentUser?._id
        );

        const newlyCreatedMessage = await postNewMessage({
          conversationId: conversation?._id,
          text: msgText,
          receiverId: receiver._id,
        });

        // send event to server after creating on client and posting to api
        devLog('EMIT'); // emits only once

        socket?.emit('sendMessage', {
          senderId: currentUser?._id,
          text: msgText,
          receiverId: receiver?._id,
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
                isCurrentUser={message._sender?._id === currentUser?._id}
                key={message?._id}
                messageText={message?.text}
                userName={message._sender?.name}
                userRank={message._sender?.rank}
                messageDate={message?.createdAt}
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
