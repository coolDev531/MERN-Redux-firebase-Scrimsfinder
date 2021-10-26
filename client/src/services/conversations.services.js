import api from './apiConfig';

/**
 * @method getUserConversations
 * @param {String} userId
 * @returns {Promise<Conversation>}
 */
export const getUserConversations = async (userData) => {
  try {
    const response = await api.get(`/conversations/user`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @method findOneConversation
 * @param {String} userId1
 * @param {String} userId2
 * @returns {Promise<Conversation>}
 */
export const findOneConversation = async (userId1, userId2) => {
  try {
    const response = await api.get(`/conversations/find/${userId1}/${userId2}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postNewConversation = async ({ senderId, receiverId }) => {
  try {
    const response = await api.post(`/conversations`, { senderId, receiverId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getConversationById = async (conversationId) => {
  try {
    const response = await api.get(
      `/conversations/find-by-id/${conversationId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const findScrimConversation = async (scrimId) => {
  try {
    const response = await api.get(`/conversations/scrim/${scrimId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
