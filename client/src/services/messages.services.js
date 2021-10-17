import api from './apiConfig';

/**
 * @method postNewMessage
 * @param {String} senderId
 * @param {String} conversationId
 * @param {String} text
 * @returns {Promise<
 *  {
 *    text: object,
 *    _conversation: object,
 *    _sender: object,
 *    _id: string,
 *    createdAt: Date
 *   }>}
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
