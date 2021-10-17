import { useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// components
import { Modal } from './../shared/ModalComponents';
import ChatRoom from '../MessengerModal_components/ChatRoom';
import UserConversations from '../MessengerModal_components/UserConversations';

export default function MessengerModal() {
  const [view, setView] = useState('conversations'); // conversations, chat-room
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
      setView('chat-room');

      // activate socket for chat or w/e
      // fetch the messages.
    } else {
      setView(value);
    }
  }, []);

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
        <ChatRoom conversation={conversation} />
      ) : (
        <UserConversations
          changeToView={changeToView}
          conversations={conversations}
        />
      )}
    </Modal>
  );
}
