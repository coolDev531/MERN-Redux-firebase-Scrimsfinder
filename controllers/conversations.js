const Conversation = require('../models/conversation');

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
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  postConversation,
  getUserConversations,
};
