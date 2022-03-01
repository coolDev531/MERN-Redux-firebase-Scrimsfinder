const { Router } = require('express');
const controllers = require('../controllers/messages.controllers');
const router = Router();
const auth = require('../middleware/auth');
const passport = require('passport');

// add
router.post(
  '/messages',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.postMessage
);
router.post(
  '/messages/post-seen/:messageId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.postMessageSeenByUser
);

// get
router.get(
  '/messages/:conversationId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.getConversationMessages
);

router.get(
  '/messages/verifiedUser/unseen-messages',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.getUserUnseenMessages
);
module.exports = router;
