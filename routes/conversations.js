const { Router } = require('express');
const router = Router();
const controllers = require('../controllers/conversations');

// create one conversation
router.post('/conversations', controllers.postConversation);

// get many conversations of user by id.
router.get('/conversations/:userId', controllers.getUserConversations);

module.exports = router;
