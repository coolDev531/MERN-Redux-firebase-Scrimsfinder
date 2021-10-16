const { Router } = require('express');
const controllers = require('../controllers/messages');
const router = Router();

// // add
router.post('/messages', controllers.postMessage);

//  get
router.get('/messages/:conversationId', controllers.getConversationMessages); // GET

module.exports = router;
