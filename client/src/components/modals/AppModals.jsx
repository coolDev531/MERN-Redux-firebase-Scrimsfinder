import useAuth from './../../hooks/useAuth';
import FriendRequestsModal from './FriendRequestsModal';
import NotificationsModal from './NotificationsModal';
import UserFriendsModal from './UserFriendsModal';
import OtherOptionsModal from './OtherOptionsModal';
import MessengerModal from './MessengerModal';

export default function AppModals() {
  const { currentUser } = useAuth();

  if (!currentUser?._id) return null;

  return (
    <>
      <FriendRequestsModal />
      <NotificationsModal />
      <MessengerModal />
      <UserFriendsModal />
      <OtherOptionsModal />
    </>
  );
}
