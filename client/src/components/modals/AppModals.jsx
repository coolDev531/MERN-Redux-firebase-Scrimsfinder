import FriendRequestsModal from './FriendRequestsModal';
import NotificationsModal from './NotificationsModal';
import UserFriendsModal from './UserFriendsModal';
import useAuth from './../../hooks/useAuth';
import OtherOptionsModal from './OtherOptionsModal';

export default function AppModals() {
  const { currentUser } = useAuth();

  if (!currentUser?._id) return null;

  return (
    <>
      <FriendRequestsModal />
      <NotificationsModal />
      <UserFriendsModal />
      <OtherOptionsModal />
    </>
  );
}
