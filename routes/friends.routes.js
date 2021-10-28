const { Router } = require('express');
const controllers = require('../controllers/friends.controllers');
const auth = require('../middleware/auth');

const router = Router();

router.get('/friend-requests', auth, controllers.getUserFriendRequests); // GET

router.post(
  '/friend-requests/send-friend-request/:userReceivingId/:userSendingId',
  controllers.sendFriendRequest
); // POST

router.post(
  '/friend-requests/:userId/reject-friend-request/:requestId',
  controllers.rejectFriendRequest // (reject friend request)
); // POST

router.post(
  '/friend-requests/accept-request/:id',
  controllers.acceptFriendRequest
); // POST (accept friend request)

router.post('/friends/unfriend-user', auth, controllers.unfriendUser); // POST (unfriend)

router.get(
  '/friend-requests/check-friend-request-sent/:receiverId',
  auth,
  controllers.checkFriendRequestSent
); // POST

router.get('/friends/user-friends/:id', controllers.getUserFriends); // GET

module.exports = router;
