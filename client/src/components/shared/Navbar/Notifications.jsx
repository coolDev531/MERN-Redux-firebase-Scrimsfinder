import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// components
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '../Tooltip';
import { Modal as NotificationsModal } from './../ModalComponents';

// icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';

// services
import {
  deleteOneUserNotification,
  deleteAllUserNotifications,
} from '../../../services/users';

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

  return (
    <>
      <Grid item style={{ position: 'relative' }}>
        <IconButton onClick={openNotifications}>
          {notifications.length > 0 ? (
            <div
              style={{
                backgroundColor: 'red',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                position: 'absolute',
                top: '0px',
                right: '-5px',
                fontSize: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {notifications.length}
            </div>
          ) : null}
          <NotificationsIcon fontSize="large" />
        </IconButton>
      </Grid>

      <NotificationsModal
        title="Notifications"
        open={notificationsOpen}
        onClose={closeNotifications}
        actionButtonStyle={{
          display: !notifications.length ? 'none' : 'inline-flex',
        }}
        actionButtonProps={{
          title: 'Mark all as read',
          onClick: async () => {
            const newNotificationsState = await deleteAllUserNotifications(
              currentUser?._id
            );

            dispatch({
              type: 'auth/updateCurrentUser',
              payload: { notifications: newNotificationsState },
            });
          },
        }}>
        <ul style={{ padding: 0, margin: 0 }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <OneNotification
                currentUserId={currentUser._id}
                closeModal={closeNotifications}
                key={notification._id}
                notification={notification}
              />
            ))
          ) : (
            <Typography
              textAlign="center"
              style={{ fontSize: '1rem' }}
              variant="h6">
              No notifications found
            </Typography>
          )}
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
      <div
        style={{ border: '1px solid red' }}
        onClick={() => {
          if (!notification?._relatedUser) return;
          console.log(notification?._relatedUser);
          closeModal();
          // openFriendRequestsModal();
        }}>
        {notification.message}
      </div>

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
