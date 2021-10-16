import api from './apiConfig';

export const getUserConversations = async (userId) => {
  try {
    const response = await api.get(`/conversations/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
