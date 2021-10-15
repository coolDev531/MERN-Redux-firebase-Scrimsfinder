import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// components
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from './../shared/Tooltip';
import { Modal } from './../shared/ModalComponents';

// utils
import {
  deleteAllUserNotifications,
  deleteOneUserNotification,
} from './../../services/users';
import { makeStyles } from '@mui/styles';

// icons
import DeleteIcon from '@mui/icons-material/Delete';

export default function NotificationsModal() {
  const dispatch = useDispatch();
  const [{ currentUser }, { notificationsOpen }] = useSelector(
    ({ auth, general }) => [auth, general]
  );

  const closeNotifications = useCallback(() => {
    dispatch({ type: 'general/closeNotifications' });
  }, [dispatch]);

  const notifications = currentUser?.notifications ?? [];

  return (
    <Modal
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
    </Modal>
  );
}

const OneNotification = ({ notification, closeModal, currentUserId }) => {
  const classes = useStyles();

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
    <li className={classes.oneNotification}>
      <div
        style={{
          border: '1px solid red',
          cursor: notification?._relatedUser ? 'pointer' : 'none',
        }}
        onClick={() => {
          if (!notification?._relatedUser) return;
          closeModal();
          dispatch({ type: 'general/openFriendRequests' });
          onDeleteNotification();
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

const useStyles = makeStyles({
  oneNotification: {
    padding: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
