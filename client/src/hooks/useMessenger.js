// hooks
import { useEffect, useState } from 'react';
import useSocket from './useSocket';
import { useDispatch, useSelector } from 'react-redux';
import useAuth from './useAuth';
import useEffectExceptOnMount from './useEffectExceptOnMount';
import useSound from 'use-sound';

// services
import {
  findOneConversation,
  getUserConversations,
} from '../services/conversations.services';

// utils
import devLog from './../utils/devLog';
import { getUserUnseenMessages } from '../services/messages.services';

//sfx
import NewMessageSFX from '../assets/sounds/new_message.mp3';

export default function useMessenger() {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { chatRoomOpen } = useSelector(({ general }) => general);
  const [arrivalMessage, setArrivalMessage] = useState(null);

  useEffect(() => {
    const fetchUserConversations = async () => {
      if (!currentUser?._id) return;

      const conversations = await getUserConversations();

      const unseenMessages = await getUserUnseenMessages();

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

    socket.emit('addUser', currentUser?._id);

    socket.on('getUsers', (users) => {
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

    socket.on('getConversation', async (data) => {
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
  }, [currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id) return;

    socket?.on('getMessage', (data) => {
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
      )
        if (arrivalMessage._receiver !== currentUser._id) {
          return;
        }

      devLog('unseen message, pushed to state');

      dispatch({
        type: 'messenger/pushUnseenMessage',
        payload: arrivalMessage,
      });
      setArrivalMessage(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrivalMessage, currentUser?._id]);

  useMessengerSound(); // play messenger notification sound whenever playSFX changes in the state.

  return null;
}

const useMessengerSound = () => {
  const [{ playSFX, msgNotificationVolume }] = useSelector(({ messenger }) => [
    messenger,
  ]);

  const [playMessengerNotificationSFX] = useSound(NewMessageSFX, {
    interrupt: true,
    volume: Number(msgNotificationVolume / 100),
  });

  useEffectExceptOnMount(() => {
    // playSFX is a boolean state in the general reducer, basically whenever socket emits a getMessage event (on useMessenger), it will dispatch an action to run this.
    playMessengerNotificationSFX();
    // play messenger notification sound whenever dispatch action: 'messenger/pushUnseenMessage' runs.
  }, [playSFX]); // play messenger notification sound whenever playSFX changes in the state.

  return null;
};

export const useScrimChat = (open, scrimId, userId) => {
  const { socket } = useSocket();

  // listen to socket whenever scrim chat modal is open.

  useEffect(() => {
    if (open) {
      socket.emit('scrimChatOpen', {
        scrimId,
        userId,
      });

      socket.on('getScrimusers', (users) => {
        devLog('socket getScrimUsers event: ', users);
      });
    }
  }, [open, socket, scrimId, userId]);

  return null;
};
