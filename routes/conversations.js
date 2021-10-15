const { Router } = require('express');
const Conversation = require('../models/conversation');
const router = Router();

router.post('/conversations', async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); // GET

module.exports = router;
