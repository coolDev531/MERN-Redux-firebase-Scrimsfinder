import api from './apiConfig';

/**
 * @method getUserConversations
 * @param {String} userId
 * @param {String} uid // current user's uid
 * @returns {Promise<Conversation>}
 */
export const getUserConversations = async () => {
  try {
    const response = await api.get(`/conversations/user`, {
      // pass uid in query params to authorize
      headers: {
        Authorization: `Bearer ${localStorage.jwtToken}`, // auth middleware takes this
      },
    });
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
