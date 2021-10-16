const Conversation = require('../models/conversation.model');

const postConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId) {
      return res.status(500).json({ message: 'senderId not provided' });
    }

    if (!receiverId) {
      return res.status(500).json({ message: 'receiverId not provided' });
    }

    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });

    const savedConversation = await newConversation.save();
    return res.status(200).json(savedConversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    });

    if (!conversations) {
      return res.status(200).json({ conversations: [] });
    }

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const findOneConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    return res.status(200).json(conversation);
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  postConversation,
  getUserConversations,
  findOneConversation,
};
