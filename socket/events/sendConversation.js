const { getUser } = require('../_helpers');

const sendConversation = async (
  io,
  { conversationId, senderId, receiverId }
) => {
  const receiverUser = getUser(receiverId); // send message to receiver from sender client

  // don't emit if there isn't a receiverUser
  if (!receiverUser) {
    return;
  }

  console.log('receiverUser! ', receiverUser);

  io.to(receiverUser.socketId).emit('getConversation', {
    senderId,
    receiverId,
    conversationId,
  });

  return;
};

module.exports = { sendConversation };
