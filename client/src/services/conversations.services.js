import api from './apiConfig';

/**
 * @method getUserConversations
 * @param {String} userId
 * @returns {Promise<Conversation>}
 */
export const getUserConversations = async (userId) => {
  try {
    const response = await api.get(`/conversations/${userId}`);
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
