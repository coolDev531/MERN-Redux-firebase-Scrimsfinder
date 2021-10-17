import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// utils
import { io } from 'socket.io-client';
import devLog from './../utils/devLog';

const socketServerUrl = 'ws://localhost:8900';

export default function useSocket() {
  // socket lifecycle stuff

  return useSelector(({ socket }) => socket);
}

export const useCreateSocket = () => {
  const socket = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.current = io(socketServerUrl);

    dispatch({ type: 'socket/setSocket', payload: socket });

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socket;
};
