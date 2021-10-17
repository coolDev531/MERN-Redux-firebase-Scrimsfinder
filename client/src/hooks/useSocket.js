import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// utils
import { io } from 'socket.io-client';

const socketServerUrl = 'ws://localhost:8900';

export default function useSocket() {
  return useSelector(({ socket }) => socket);
}

// socket lifecycle stuff
export const useCreateSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let socket = io(socketServerUrl);

    dispatch({ type: 'socket/setSocket', payload: socket });

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return;
};
