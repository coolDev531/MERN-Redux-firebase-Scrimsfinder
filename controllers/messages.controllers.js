const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');

const mongoose = require('mongoose');

const handleValidId = async (id, res) => {
  let isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid) {
    return res.status(500).json({ error: 'invalid id' });
  }
};

// @route   POST /api/messages
// @desc    post a new message
// @access  Private
const postMessage = async (req, res) => {
  try {
    const { text, conversationId, receiverId } = req.body;
    const senderId = req.user._id ?? '';

    await handleValidId(conversationId, res);
    await handleValidId(senderId, res);

    const conversation = await Conversation.findById(conversationId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(500).json({ error: 'Sender not found!' });
    }

    if (!text) {
      return res.status(500).json({ error: 'Message text not provided!' });
    }

    if (!conversation) {
      return res.status(500).json({ error: 'Conversation not found!' });
    }

    const newMessage = new Message({
      text,
      _conversation: conversation._id,
      _sender: sender._id,
      _seenBy: [sender._id],
      _receiver: receiverId,
    });

    let savedMessage = await newMessage.save();

    // make sure we get _sender.name, region, rank etc after creating with populate, or else it will only return id to the client
    savedMessage = await savedMessage
      .populate('_sender', ['name', 'discord', 'rank', 'region'])
      .execPopulate();

    return res.status(200).json(savedMessage);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/messages/:conversationId
// @desc    get the messages of the conversation by conversation._id
// TODO: there should be a check for if it's a scrim conversation make it public, else make it private if it's private DM
// @access  Public
const getConversationMessages = async (req, res) => {
  try {
    await Message.find({
      _conversation: req.params.conversationId,
    })
      .populate('_sender', ['name', 'discord', 'region', 'rank'])
      .exec((err, messagesData) => {
        if (err) {
          console.log(err);
          return res.status(400).end();
        }
        return res.status(200).json(messagesData);
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST /api/messages/post-seen/:messageId
// @desc    post that the message has been seen by the currentUser
// @access  Private
const postMessageSeenByUser = async (req, res) => {
  try {
    const { messageId } = req.params;
    const seenByUserId = req.user._id ?? false;

    await handleValidId(messageId, res);

    if (!seenByUserId) {
      return res.status(500).json({
        error: 'seen by user id not provided! (req.body.seenByUserId)',
      });
    }

    let message = await Message.findById(messageId);

    message._seenBy = [...message._seenBy, seenByUserId];

    const savedMessage = await message.save();

    return res.status(200).json({ updatedMessage: savedMessage, status: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/messages/unseen-messages/:userId
// @desc    get the messages that the user didn't see by user._id
// @access  Private
const getUserUnseenMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId).select(['friends']);

    await handleValidId(userId, res);

    const messages = await Message.find({ _receiver: userId });

    const friendIds = currentUser.friends.map(({ _id }) => _id);

    const unseenMessages = messages.filter((message) => {
      if (!message?._seenBy.some((id) => friendIds.includes(id))) return false; // if not friend, return false. (if unfriended)

      return !message?._seenBy?.includes(userId); // return if is friend and user didn't see it.
    });

    return res.status(200).json(unseenMessages);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  postMessage,
  getConversationMessages,
  postMessageSeenByUser,
  getUserUnseenMessages,
};
