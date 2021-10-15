import { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from '../shared/ModalComponents';
import Typography from '@mui/material/Typography';

export default function FriendRequestsModal() {
  const [{ friendRequestsOpen }, { currentUser }] = useSelector(
    ({ general, auth }) => [general, auth]
  );
  const dispatch = useDispatch();

  const onClose = () => dispatch({ type: 'general/closeFriendRequests' });

  const friendRequests = currentUser?.friendRequests ?? [];

  return (
    <Modal title="Friend Requests" open={friendRequestsOpen} onClose={onClose}>
      {friendRequests.length > 0 ? (
        friendRequests.map((friendRequest) => (
          <OneFriendRequest
            key={friendRequest._id}
            friendRequest={friendRequest}
          />
        ))
      ) : (
        <Typography
          variant="h6"
          textAlign="center"
          style={{ fontSize: '1rem' }}>
          No friend requests found
        </Typography>
      )}
    </Modal>
  );
}

const OneFriendRequest = memo(({ friendRequest }) => {
  return (
    <div>
      <pre>{JSON.stringify(friendRequest, null, 2)}</pre>
    </div>
  );
});
