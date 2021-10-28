const { Router } = require('express');
const controllers = require('../controllers/messages.controllers');
const router = Router();
const auth = require('../middleware/auth');

// add
router.post('/messages', controllers.postMessage);
router.post(
  '/messages/post-seen/:messageId',
  controllers.postMessageSeenByUser
);

// get
router.get('/messages/:conversationId', controllers.getConversationMessages);
router.get(
  '/messages/verifiedUser/unseen-messages',
  auth,
  controllers.getUserUnseenMessages
);
module.exports = router;
