import { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from '../shared/ModalComponents';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from './../shared/Tooltip';

// utils
import { getRankImage } from './../../utils/getRankImage';

import CheckIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function FriendRequestsModal() {
  const [{ friendRequestsOpen }, { currentUser }, { allUsers }] = useSelector(
    ({ general, auth, users }) => [general, auth, users]
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
            requestUser={allUsers.find(
              ({ _id }) => _id === friendRequest._user
            )}
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

const OneFriendRequest = memo(({ friendRequest, requestUser }) => {
  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <Grid item container alignItems="center" xs={6}>
        <img
          src={getRankImage(requestUser)}
          alt={requestUser.rank}
          width="20"
        />
        &nbsp;
        <span>{requestUser.name}</span>
        <span>({requestUser.region})</span>
      </Grid>

      <Grid item>
        <Tooltip title="Reject">
          <IconButton>
            <CancelIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Accept">
          <IconButton>
            <CheckIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
});
