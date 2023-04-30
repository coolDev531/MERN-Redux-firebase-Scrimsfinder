const { getUser } = require('../_helpers');

const sendNotification = async (
  io,
  {
    message,
    _relatedUser = null,
    receiverId,
    isConversationStart = false,
    isFriendRequest = false,
    _relatedScrim = null,
    conversation,
  }
) => {
  const receiverUser = getUser(receiverId); // send message to receiver from sender client

  // don't emit if there isn't a receiverUser
  if (!receiverUser) {
    return;
  }

  console.log('receiverUser! ', receiverUser);

  io.to(receiverUser.socketId).emit('getNotification', {
    message,
    receiverId,
    _relatedUser,
    isConversationStart,
    _relatedScrim,
    isFriendRequest,
    conversation,
  });

  return;
};

module.exports = { sendNotification };
