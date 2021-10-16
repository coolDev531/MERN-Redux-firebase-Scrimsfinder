import { useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// components
import { Modal } from './../shared/ModalComponents';
import ChatRoom from '../MessengerModal_components/ChatRoom';
import UserConversations from '../MessengerModal_components/UserConversations';

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
        <UserConversations
          changeToView={changeToView}
          conversations={conversations}
        />
      )}
    </Modal>
  );
}
