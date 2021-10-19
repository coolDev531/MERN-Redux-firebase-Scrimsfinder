import { useEffect } from 'react';
import {
  findOneConversation,
  getUserConversations,
} from '../services/conversations.services';
import { useDispatch, useSelector } from 'react-redux';
import useAuth from './useAuth';
import devLog from './../utils/devLog';

import useSocket from './useSocket';

export default function useMessenger() {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { chatRoomOpen } = useSelector(({ general }) => general);

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
  }, [currentUser?._id, currentUser?.friends, socket, dispatch]);

  useEffect(() => {
    if (!currentUser?._id) return;

    socket.current?.on('getMessage', async (data) => {
      if (chatRoomOpen?.conversation?._id === data?._conversation) {
        return; // message has been seen (chat is open)
      } else {
        devLog('unseen message, pushed to state');
        if (!data._seenBy.includes(currentUser?._id)) {
          dispatch({ type: 'messenger/pushUnseenMessage', payload: data });
        }
      }
    });
  }, [chatRoomOpen?.conversation?._id, currentUser?._id, dispatch, socket]);
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
