import api from './apiConfig';

/**
 * @method postNewMessage
 * @param {String} senderId
 * @param {String} conversationId
 * @returns {<{text: string, _conversation: string, _sender: string}>}
 */
export const postNewMessage = async ({ conversationId, senderId }) => {
  try {
    const response = await api.post(`/messages`, {
      conversationId,
      senderId,
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
