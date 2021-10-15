import { useCallback } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '../Tooltip';
import { Modal as NotificationsModal } from './../ModalComponents';
import { useSelector, useDispatch } from 'react-redux';

// icons
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteOneUserNotification } from '../../../services/users';

export default function Notifications() {
  const [{ notificationsOpen }, { currentUser }] = useSelector(
    ({ general, auth }) => [general, auth]
  );

  const dispatch = useDispatch();

  const notifications = currentUser?.notifications ?? [];

  const openNotifications = useCallback(() => {
    dispatch({ type: 'general/openNotifications' });
  }, [dispatch]);

  const closeNotifications = useCallback(() => {
    dispatch({ type: 'general/closeNotifications' });
  }, [dispatch]);

  if (!notifications.length) return null;

  return (
    <>
      <Grid item>
        <IconButton onClick={openNotifications}>
          <NotificationsIcon fontSize="large" />
        </IconButton>
      </Grid>

      <NotificationsModal
        title="Notifications"
        open={notificationsOpen}
        onClose={closeNotifications}>
        <ul style={{ padding: 0, margin: 0 }}>
          {notifications.map((notification) => (
            <OneNotification
              currentUserId={currentUser._id}
              closeModal={closeNotifications}
              key={notification._id}
              notification={notification}
            />
          ))}
        </ul>
      </NotificationsModal>
    </>
  );
}

const OneNotification = ({ notification, closeModal, currentUserId }) => {
  const dispatch = useDispatch();
  const onDeleteNotification = async () => {
    const resp = await deleteOneUserNotification(
      currentUserId,
      notification._id
    );

    const newNotificationsState = resp.notifications;

    dispatch({
      type: 'auth/updateCurrentUser',
      payload: { notifications: newNotificationsState },
    });
  };
  return (
    <li
      style={{
        padding: '5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <div style={{ border: '1px solid red' }}>{notification.message}</div>

      <div>
        <Tooltip title="Delete notification">
          <IconButton onClick={onDeleteNotification}>
            <DeleteIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </div>
    </li>
  );
};
