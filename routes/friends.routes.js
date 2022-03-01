const { Router } = require('express');
const controllers = require('../controllers/friends.controllers');
const auth = require('../middleware/auth');
const passport = require('passport');

const router = Router();

router.get(
  '/friend-requests',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.getUserFriendRequests
); // GET

router.post(
  '/friend-requests/send-friend-request/:userReceivingId/:userSendingId',
  passport.authenticate('jwt', { session: false }),
  controllers.sendFriendRequest
); // POST

router.post(
  '/friend-requests/:userId/reject-friend-request/:requestId',
  controllers.rejectFriendRequest // (reject friend request)
); // POST

router.post(
  '/friend-requests/accept-request/:id',
  passport.authenticate('jwt', { session: false }),
  controllers.acceptFriendRequest
); // POST (accept friend request)

router.post(
  '/friends/unfriend-user',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.unfriendUser
); // POST (unfriend)

router.get(
  '/friend-requests/check-friend-request-sent/:receiverId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.checkFriendRequestSent
); // POST

router.get('/friends/user-friends/:id', controllers.getUserFriends); // GET

module.exports = router;
