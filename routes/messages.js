const { Router } = require('express');
const Message = require('../models/message');
const router = Router();

// // add
router.post('/messages', async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    return res.status(200).json(savedMessage);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// // get
// router.get('/messages', () => {}); // GET

module.exports = router;
