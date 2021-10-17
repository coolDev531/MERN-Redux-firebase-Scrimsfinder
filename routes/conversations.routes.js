const { Router } = require('express');
const router = Router();
const controllers = require('../controllers/conversations.controllers');

// create one conversation
router.post('/conversations', controllers.postConversation);

// get many conversations of user by id.
router.get('/conversations/user/:userId', controllers.getUserConversations);

// get one scrim conversation
router.get('/conversations/scrim/:scrimId', controllers.findScrimConversation);

// get one conv includes two userId
router.get(
  '/conversations/find/:firstUserId/:secondUserId',
  controllers.findOneConversation
);

router.get(
  '/conversations/find-by-id/:conversationId',
  controllers.findOneConversationById
);

module.exports = router;
