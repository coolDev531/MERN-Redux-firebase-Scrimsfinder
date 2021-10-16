const { Router } = require('express');
const router = Router();
const controllers = require('../controllers/conversations.controllers');

// create one conversation
router.post('/conversations', controllers.postConversation);

// get many conversations of user by id.
router.get('/conversations/:userId', controllers.getUserConversations);

// get one conv includes two userId
router.get(
  '/conversations/find/:firstUserId/:secondUserId',
  controllers.findOneConversation
);

module.exports = router;
