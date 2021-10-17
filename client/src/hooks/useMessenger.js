import { useEffect, useRef } from 'react';
import { getUserConversations } from '../services/conversations.services';
import { useDispatch } from 'react-redux';
import useAuth from './useAuth';
import devLog from './../utils/devLog';
import { useCreateSocket } from './useSocket';

export default function useMessenger() {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const socket = useCreateSocket();

  useEffect(() => {
    if (!currentUser?._id) return;

    const fetchUserConversations = async () => {
      const conversations = await getUserConversations(currentUser?._id);

      dispatch({
        type: 'messenger/setConversations',
        payload: conversations,
      });
    };
    fetchUserConversations();
  }, [currentUser?._id, dispatch]);

  useEffect(() => {
    if (!currentUser?._id) return;

    socket.current.emit('addUser', currentUser?._id);
    socket.current.on('getUsers', (users) => {
      devLog('socket getUsers event: ', users);

      const onlineUserIds = users.map(({ userId }) => userId);
      dispatch({ type: 'messenger/setOnlineUsers', payload: onlineUserIds });
    });
    // send event to socket server.
  }, [currentUser?._id, socket, dispatch]);

  return null;
}
