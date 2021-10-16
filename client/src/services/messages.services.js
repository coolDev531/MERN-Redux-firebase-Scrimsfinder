import api from './apiConfig';

/**
 * @method postNewMessage
 * @param {String} senderId
 * @param {String} conversationId
 * @param {String} text
 * @returns {Promise<{text: string, _conversation: string, _sender: string}>}
 */
export const postNewMessage = async ({ conversationId, senderId, text }) => {
  try {
    const response = await api.post(`/messages`, {
      conversationId,
      senderId,
      text,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
