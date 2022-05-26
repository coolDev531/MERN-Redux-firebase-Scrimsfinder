const { Router } = require('express');
const controllers = require('../controllers/scrims.controllers');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const passport = require('passport');
const router = Router();

router.get('/scrims', controllers.getAllScrims); // GET
router.get('/scrims/today', controllers.getTodaysScrims); // GET
router.post(
  '/scrims',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.createScrim
); // POST
router.get('/scrims/:id', controllers.getScrimById); // GET
router.put(
  '/scrims/:id',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.updateScrim
); // PUT

// PUT => Set all new attributes for an existing resource.
// PATCH => Partially update an existing resource (not all attributes required).
// patch because these routes add a subsidiary resource instead of completely replacing whatever is available.

router.patch(
  '/scrims/:id/add-image',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.addImageToScrim
); // PATCH

router.patch(
  '/scrims/:id/remove-image',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.removeImageFromScrim
); // PATCH

router.patch(
  '/scrims/:scrimId/insert-player/:userId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.insertPlayerInScrim
); // PATCH
router.patch(
  '/scrims/:scrimId/remove-player/:userId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.removePlayerFromScrim
); // PATCH
router.patch(
  '/scrims/:scrimId/move-player/:userId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.movePlayerInScrim
); // PATCH

router.patch(
  '/scrims/:scrimId/insert-caster/:casterId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.insertCasterInScrim
); // PATCH
router.patch(
  '/scrims/:scrimId/remove-caster/:casterId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.removeCasterFromScrim
); // PATCH

router.patch(
  '/scrims/:id/set-winner',
  auth,
  passport.authenticate('jwt', { session: false }),
  controllers.setScrimWinner
); // PATCH

router.delete(
  '/scrims/:id',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.deleteScrim
); // DELETE

router.patch(
  '/scrims/:scrimId/swap-players',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.swapPlayersInScrim
); // PATCH

module.exports = router;
