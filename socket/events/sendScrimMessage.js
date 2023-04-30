const sendScrimMessage = async (
  io,
  { senderId, text, messageId, createdAt, _conversation }
) => {
  console.log('sendScrimMessage');
  // don't emit if there isn't a receiverUser

  io.emit('getScrimMessage', {
    senderId,
    text,
    messageId,
    createdAt,
    _conversation, // make sure that it's only being sent to that specific scrim chat box.
  });

  return;
};

module.exports = { sendScrimMessage };
