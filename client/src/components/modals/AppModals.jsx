import { useSelector } from 'react-redux';

import useAuth from './../../hooks/useAuth';
import FriendRequestsModal from './FriendRequestsModal';
import NotificationsModal from './NotificationsModal';
import UserFriendsModal from './UserFriendsModal';
import OtherOptionsModal from './OtherOptionsModal';
import ChatRoomModal from './ChatRoomModal';
import ScrimChatRoomModal from './ScrimChatRoomModal';
import ConversationCreateModal from './ConversationCreateModal';

export default function AppModals() {
  const { currentUser } = useAuth();
  const { chatRoomOpen, scrimChatRoomOpen } = useSelector(
    ({ general }) => general
  );

  if (!currentUser?._id) return null;

  return (
    <>
      <FriendRequestsModal />
      <NotificationsModal />
      <UserFriendsModal />
      <OtherOptionsModal />
      {chatRoomOpen.isOpen && <ChatRoomModal />}
      {scrimChatRoomOpen.isOpen && <ScrimChatRoomModal />}
      <ConversationCreateModal
      // open={isCreateModalOpen === friendUser?._id}
      // setOpen={setIsCreateModalOpen}
      // receiverUser={friendUser}
      />
    </>
  );
}
