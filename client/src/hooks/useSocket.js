import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';

export default function useSocket() {
  return useSelector(({ socket }) => socket);
}

const socketServerUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_SOCKET_URL
    : 'http://localhost:3000';

export const useCreateSocket = () => {
  const dispatch = useDispatch();

  // initialize socket
  useEffect(() => {
    let socket = io(socketServerUrl, {
      extraHeaders: {
        'x-api-key': process.env.REACT_APP_API_KEY,
      },
    });

    dispatch({ type: 'socket/setSocket', payload: socket });

    return () => {
      socket.disconnect();
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
