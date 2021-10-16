import { useEffect } from 'react';
import { getUserConversations } from '../services/conversations.service';
import { useDispatch } from 'react-redux';
import useAuth from './useAuth';

export default function useMessenger() {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();

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

  return null;
}
