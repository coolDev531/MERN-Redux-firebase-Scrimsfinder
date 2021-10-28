const { Router } = require('express');
const controllers = require('../controllers/notification.controllers');
const auth = require('../middleware/auth');

const router = Router();

router.get(
  '/notifications/user-notifications',
  auth,
  controllers,
  getUserNotifications
); // GET

router.post(
  '/notifications/:id/push-user-notification/',
  controllers.pushUserNotification
); // POST
router.post(
  '/notifications/:userId/remove-user-notification/:notificationId',
  controllers.removeUserNotification
); // POST

router.post(
  '/notifications/remove-all-user-notifications/:id',
  controllers.removeAllUserNotifications
); // POST

module.exports = router;
