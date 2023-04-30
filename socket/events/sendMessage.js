const { getUser } = require('../_helpers');

const sendMessage = async (
  io,
  { senderId, receiverId, text, messageId, createdAt, _conversation }
) => {
  const receiverUser = getUser(receiverId); // send message to receiver from sender client

  // don't emit if there isn't a receiverUser
  if (!receiverUser) {
    return;
  }

  io.to(receiverUser.socketId).emit('getMessage', {
    _sender: senderId,
    text,
    messageId,
    createdAt,
    _conversation,
    _receiver: receiverId,
    messageId,
    _seenBy: [senderId],
  });

  return;
};

module.exports = { sendMessage };
