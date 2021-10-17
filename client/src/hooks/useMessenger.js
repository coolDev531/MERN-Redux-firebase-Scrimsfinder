import { useEffect, useRef } from 'react';
import { getUserConversations } from '../services/conversations.services';
import { useDispatch } from 'react-redux';
import useAuth from './useAuth';
import devLog from './../utils/devLog';

import { io } from 'socket.io-client';

const socketServerUrl = 'ws://localhost:8900';

export default function useMessenger() {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  let socket = useRef();

  useEffect(() => {
    socket.current = io(socketServerUrl);

    dispatch({ type: 'socket/setSocket', payload: socket });

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
}
