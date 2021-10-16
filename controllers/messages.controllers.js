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

const postMessage = async (req, res) => {
  try {
    const { conversationId, senderId } = req.body;

    await handleValidId(conversationId, res);
    await handleValidId(senderId, res);

    const conversation = await Conversation.findById(conversationId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(500).json({ error: 'Sender not found!' });
    }

    if (!conversation) {
      return res.status(500).json({ error: 'Conversation not found!' });
    }

    const newMessage = new Message({
      text: req.body.text,
      _conversation: conversation._id,
      _sender: sender._id,
    });

    const savedMessage = await newMessage.save();
    return res.status(200).json(savedMessage);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      _conversation: req.params.conversationId,
    });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  postMessage,
  getConversationMessages,
};
