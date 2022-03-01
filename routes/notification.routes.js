const { Router } = require('express');
const controllers = require('../controllers/notification.controllers');
const auth = require('../middleware/auth');
const passport = require('passport');

const router = Router();

router.get(
  '/notifications/user-notifications',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.getUserNotifications
); // GET

router.post(
  '/notifications/push-user-notification/:userId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.pushUserNotification
); // POST

router.post(
  '/notifications/remove-user-notification/:notificationId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.removeUserNotification
); // POST

router.post(
  '/notifications/remove-all-user-notifications/:id',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.removeAllUserNotifications
); // POST

module.exports = router;
