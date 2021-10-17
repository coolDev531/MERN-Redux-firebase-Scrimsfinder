import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// components
import { Modal } from './../shared/ModalComponents';
import ChatRoom from '../MessengerModal_components/ChatRoom';
import UserConversations from '../MessengerModal_components/UserConversations';

// utils
import { io } from 'socket.io-client';
import devLog from './../../utils/devLog';
const socketServerUrl = 'ws://localhost:8900';

export default function MessengerModal() {
  const [{ conversations }, { messengerOpen }, { currentUser }] = useSelector(
    ({ messenger, general, auth }) => [messenger, general, auth]
  );
  const [view, setView] = useState('conversations'); // conversations, chat-room
  const [conversation, setConversation] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socket = useRef();

  const dispatch = useDispatch();

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
      setView('chat-room');

      // activate socket for chat or w/e
      // fetch the messages.
    } else {
      setView(value);
    }
  }, []);

  // socket lifecycle stuff
  useEffect(() => {
    if (!messengerOpen) return;

    socket.current = io(socketServerUrl);
  }, [messengerOpen]);

  useEffect(() => {
    // send event to socket server.
    if (!currentUser?._id) return;
    if (!messengerOpen) return; // dont send messages to servers and receive if messenger is not open

    socket.current?.emit('addUser', currentUser?._id);
    socket.current?.on('getUsers', (users) => {
      devLog('socket getUsers event: ', users);

      const onlineUserIds = users.map(({ userId }) => userId);
      setOnlineUsers(onlineUserIds);
    });
  }, [currentUser?._id, messengerOpen]);

  return (
    <Modal
      customStyles={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '600px',
        maxWidth: '600px',
        maxHeight: '100%', // 100% to follow chat bubble overflow instead.
        overflowWrap: 'break-word',
      }}
      renderBackButton={view === 'chat-room'}
      onClickBack={() => changeToView('conversations')}
      title={modalTitle}
      open={messengerOpen}
      onClose={closeMessenger}>
      {view === 'chat-room' ? (
        <ChatRoom
          socket={socket.current}
          conversation={conversation}
          currentUser={currentUser}
        />
      ) : (
        <UserConversations
          onlineUsers={onlineUsers}
          currentUser={currentUser}
          changeToView={changeToView}
          conversations={conversations}
        />
      )}
    </Modal>
  );
}
