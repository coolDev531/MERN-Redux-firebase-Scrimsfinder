const { Router } = require('express');
const controllers = require('../controllers/users.controllers');
const auth = require('../middleware/auth');

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

module.exports = router;
