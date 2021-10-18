const { Router } = require('express');
const controllers = require('../controllers/users.controllers');

const router = Router();

router.get('/users', controllers.getAllUsers); // GET

router.get('/users/:name', controllers.getOneUser); // GET (this route has an optional adminKey query), it has to be below the other routes or it wont find the user
router.get('/users/by-id/:id', controllers.getUserById); // get

router.get('/users/:id/created-scrims', controllers.getUserCreatedScrims); // GET
router.get('/users/:id/scrims', controllers.getUserParticipatedScrims); // GET

router.get('/users/user-notifications/:id', controllers.getUserNotifications); // GET
router.post('/users/:id/push-notification/', controllers.pushUserNotification); // POST
router.post(
  '/users/:userId/remove-notification/:notificationId',
  controllers.removeUserNotification
); // POST

router.post(
  '/users/remove-all-notifications/:id',
  controllers.removeAllUserNotifications
); // POST

router.get(
  '/users/user-friend-requests/:userId',
  controllers.getUserFriendRequests
); // GET

router.post(
  '/users/send-friend-request/:userReceivingId/:userSendingId',
  controllers.sendFriendRequest
); // POST

router.post(
  '/users/:userId/remove-friend-request/:requestId',
  controllers.removeFriendRequest
); // POST

router.post('/users/add-new-friend/:id', controllers.addUserFriend); // POST
router.post('/users/remove-friend/:id', controllers.removeUserFriend); // POST

router.get('/users/user-friends/:userId', controllers.getUserFriends); // GET

module.exports = router;
