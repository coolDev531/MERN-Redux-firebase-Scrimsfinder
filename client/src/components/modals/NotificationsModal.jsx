import { Children, memo, useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
// components
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from './../shared/Tooltip';
import { Modal } from './../shared/ModalComponents';
import Moment from 'react-moment';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

// utils and services
import {
  deleteAllUserNotifications,
  deleteOneUserNotification,
} from '../../services/notification.services';
import { getUserById } from './../../services/users.services';
import { makeStyles } from '@mui/styles';

// icons
import DeleteIcon from '@mui/icons-material/Delete';

function NotificationsModal({ currentUser, notificationsOpen }) {
  const dispatch = useDispatch();

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
          //  delete all notifications
          const { notifications } = await deleteAllUserNotifications(
            currentUser?._id
          );

          dispatch({
            type: 'auth/updateCurrentUser',
            payload: { notifications },
          });
        },
      }}>
      <ul style={{ padding: 0, margin: 0 }}>
        {notifications.length > 0 ? (
          // using children because when notification gets received from socket it doesn't have id so we just get unique keys with React.Children
          Children.toArray(
            notifications
              .sort((a, b) => {
                // I don't know why I gave it a createdDate property when mongoose just adds timestamps...
                let aValue = a?.createdDate ?? a?.createdAt;
                let bValue = b?.createdDate ?? b.createdAt;

                // latest first
                return new Date(bValue).getTime() - new Date(aValue).getTime();
              })
              .map((notification, idx, arr) => (
                <>
                  <OneNotification
                    key={notification._id}
                    currentUserId={currentUser._id}
                    closeModal={closeNotifications}
                    notification={notification}
                    notifications={notifications}
                  />
                  {idx !== arr.length - 1 ? (
                    <Box my={2}>
                      <Divider />
                    </Box>
                  ) : null}
                </>
              ))
          )
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

const OneNotification = memo(({ notification, closeModal }) => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const [isHover, setIsHover] = useState(false);

  const onDeleteNotification = useCallback(async () => {
    const resp = await deleteOneUserNotification(notification._id);

    const newNotificationsState = resp.notifications;

    dispatch({
      type: 'auth/updateCurrentUser',
      payload: { notifications: newNotificationsState },
    });
  }, [notification, dispatch]);

  const relatedItem = useMemo(() => {
    if (notification?._relatedUser) {
      return 'user';
    } else if (notification?._relatedScrim) return 'scrim';

    return null;
  }, [notification]);

  return (
    <li className={classes.oneNotification}>
      <Tooltip
        title={
          notification.isConversationStart
            ? 'Open conversation'
            : notification.isFriendRequest
            ? 'Go to friend requests'
            : notification.isScrimAlert
            ? 'Go to scrim page'
            : notification.message.includes('are now friends') &&
              'Visit friend page'
        }
        open={isHover && relatedItem !== null}>
        <div
          onMouseOver={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            cursor: relatedItem ? 'pointer' : 'inherit',
            alignItems: 'flex-start',
          }}
          onClick={async () => {
            if (!relatedItem) return;
            closeModal();

            if (notification.isFriendRequest) {
              dispatch({ type: 'general/openFriendRequests' });
            } else if (notification.isScrimAlert) {
              history.push(`/scrims/${notification?._relatedScrim}`);
            } else if (notification.isConversationStart) {
              dispatch({
                type: 'general/chatRoomOpen',
                payload: {
                  conversation: notification.conversation,
                  isOpen: true,
                },
              });
            } else if (notification.message.includes('are now friends')) {
              const user = await getUserById(notification._relatedUser);
              history.push(`/users/${user.name}?region=${user.region}`);
            }
          }}>
          <span style={{ fontSize: '0.8rem', color: '#ccc' }}>
            <Moment format="MM/DD/yyyy hh:mm A">
              {notification?.createdDate ?? notification?.createdAt}
            </Moment>
          </span>
          <span style={{ fontSize: '1rem' }}>{notification.message}</span>
        </div>
      </Tooltip>

      <div>
        <Tooltip title="Mark as read">
          <IconButton onClick={onDeleteNotification}>
            <DeleteIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </div>
    </li>
  );
});

const useStyles = makeStyles({
  oneNotification: {
    padding: '10px 5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
});

// using connect here so with memo the component won't rerender when it's not supposed to
export default memo(
  connect((state) => {
    return {
      currentUser: state.auth.currentUser,
      notificationsOpen: state.general.notificationsOpen,
    };
  })(NotificationsModal)
);
