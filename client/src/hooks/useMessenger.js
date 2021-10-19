// hooks
import { useEffect, useState } from 'react';
import useSocket from './useSocket';
import { useDispatch, useSelector } from 'react-redux';
import useAuth from './useAuth';
import useEffectExceptOnMount from './useEffectExceptOnMount';

// services
import {
  findOneConversation,
  getUserConversations,
} from '../services/conversations.services';

// utils
import devLog from './../utils/devLog';
import { getUserUnseenMessages } from '../services/messages.services';

export default function useMessenger() {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { chatRoomOpen } = useSelector(({ general }) => general);
  const [arrivalMessage, setArrivalMessage] = useState(null);

  useEffect(() => {
    if (!currentUser?._id) return;

    const fetchUserConversations = async () => {
      const conversations = await getUserConversations(currentUser?._id);
      const unseenMessages = await getUserUnseenMessages(currentUser?._id);

      dispatch({
        type: 'messenger/setConversations',
        payload: conversations,
      });

      dispatch({
        type: 'messenger/setUnseenMessages',
        payload: unseenMessages,
      });
    };
    fetchUserConversations();
  }, [currentUser?._id, dispatch]);

  useEffect(() => {
    if (!currentUser?._id) return;

    socket.current.emit('addUser', currentUser?._id);

    socket.current.on('getUsers', (users) => {
      devLog('socket getUsers event: ', users);

      // if you want to get all online users
      const onlineUserIds = users.map(({ userId }) => userId);

      dispatch({ type: 'users/setOnlineUsers', payload: onlineUserIds });

      // ONLY GET THIS USERS FRIENDS
      const currentUserFriends = currentUser.friends
        .filter((friend) => users.some((u) => u.userId === friend._id))
        .map(({ _id }) => _id); // only get ids

      dispatch({
        type: 'messenger/setOnlineFriends',
        payload: currentUserFriends,
      });
    });

    socket.current.on('getConversation', async (data) => {
      devLog('socket getConversation event: ', data);

      if (data.receiverId === currentUser._id) {
        const newConversation = await findOneConversation(
          data.senderId,
          data.receiverId
        );

        dispatch({
          type: 'messenger/addNewConversation',
          payload: newConversation,
        });
      }
    });

    // send event to socket server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id, currentUser?.friends]);

  useEffect(() => {
    if (!currentUser?._id) return;

    socket.current?.on('getMessage', (data) => {
      setArrivalMessage({ ...data, _id: data.messageId });
    });

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id]);

  useEffectExceptOnMount(() => {
    if (!currentUser?._id) return;

    if (arrivalMessage) {
      if (
        // if chat room is open but it's a different room that means it's an unseen message
        chatRoomOpen?.conversation?._id !== arrivalMessage?._conversation
      ) {
        devLog('unseen message, pushed to state');

        dispatch({
          type: 'messenger/pushUnseenMessage',
          payload: arrivalMessage,
        });
        setArrivalMessage(null);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrivalMessage, currentUser?._id]);

  return null;
}

export const useScrimChat = (open, scrimId, userId) => {
  // add user to scrim chat

  const { socket } = useSocket();

  useEffect(() => {
    if (open) {
      socket.current.emit('scrimChatOpen', {
        scrimId,
        userId,
      });

      socket.current.on('getScrimusers', (users) => {
        devLog('socket getScrimUsers event: ', users);
      });
    }
  }, [open, socket, scrimId, userId]);
};
