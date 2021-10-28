// hooks
import { useEffect } from 'react';
import useSocket from './useSocket';
import useAuth from './useAuth';
import { useDispatch, useSelector } from 'react-redux';

// utils
import devLog from './../utils/devLog';

// services
import { getUserById } from '../services/users.services';
import { getUserNotifications } from '../services/notification.services';

export default function useNotifications() {
  const { socket } = useSocket();
  const { currentUser } = useAuth();
  const dispatch = useDispatch();

  const { notificationsOpen } = useSelector(({ general }) => general);

  useEffect(() => {
    if (!socket) return;
    if (!currentUser?._id) return;

    // listen to socket server and get notification data.
    socket.on('getNotification', async (data) => {
      devLog('socket getNotification event: ', data);
      if (currentUser._id === data.receiverId) {
        const newNotification = {
          message: data.message,
          createdAt: Date.now(),
          createdDate: Date.now(), // i added this timestamp on backend for some reason...
          _relatedUser: data?._relatedUser ?? null,
          _relatedScrim: data?.relatedScrim ?? null,
          isConversationStart: data?.isConversationStart ?? false,
          isFriendRequest: data?.isFriendRequest ?? false,
          conversation: data?.conversation ?? null,
        };

        // add it to the currentUsers notifications array.
        dispatch({
          type: 'auth/addNotification',
          payload: newNotification,
        });

        // add new user to the current user friends array
        if (newNotification?.message.includes('are now friends')) {
          const friendUser = await getUserById(newNotification?._relatedUser);
          dispatch({
            type: 'auth/updateCurrentUser',
            payload: { friends: [...currentUser?.friends, friendUser] },
          });
        }
      }
    });

    //  eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, currentUser?._id, dispatch]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?._id) return;
      devLog('fetching notifications for currentUser');

      const { notifications } = await getUserNotifications(currentUser?._id);

      // update the user in the state
      dispatch({ type: 'auth/updateCurrentUser', payload: { notifications } });
    };

    fetchNotifications();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id, notificationsOpen]); // refetch when opening modal

  return null;
}
