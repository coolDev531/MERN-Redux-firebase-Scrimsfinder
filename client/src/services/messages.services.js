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
 *    _conversation: string,
 *    _sender: string,
 *    _seenBy: array,
 *    _receiver: string,
 *   }>}
 */
export const postNewMessage = async ({
  conversationId,
  senderId,
  text,
  receiverId = null,
}) => {
  try {
    const response = await api.post(`/messages`, {
      conversationId,
      senderId,
      text,
      receiverId,
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

/**
 * @method postMessageSeenByUser
 * @param {String} messageId
 * @param {String} seenByUserId
 * @returns {Promise<{status: boolean, updatedMessage: object}>}
 */
export const postMessageSeenByUser = async (messageId, seenByUserId) => {
  try {
    const response = await api.post(`/messages/post-seen/${messageId}`, {
      seenByUserId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @method getUserUnseenMessages
 * @desc get the messages that the current user didn't see (sent by his friends)
 * @access  private
 * @returns
 */
export const getUserUnseenMessages = async () => {
  try {
    const response = await api.get('/messages/verifiedUser/unseen-messages');
    return response.data;
  } catch (error) {
    throw error;
  }
};
