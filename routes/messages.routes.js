const { Router } = require('express');
const controllers = require('../controllers/messages.controllers');
const router = Router();

// add
router.post('/messages', controllers.postMessage);
router.post(
  '/messages/post-seen/:messageId',
  controllers.postMessageSeenByUser
);

// get
router.get('/messages/:conversationId', controllers.getConversationMessages); // GET

module.exports = router;
