const { Router } = require('express');
const router = Router();
const controllers = require('../controllers/conversations');

// create  conv
router.post('/conversations', controllers.postConversation);

// get conv many of user by id.
router.get('/conversations/:userId', controllers.getUserConversations);

module.exports = router;
