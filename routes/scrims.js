const { Router } = require('express');
const controllers = require('../controllers/scrims');

const router = Router();

router.get('/scrims', controllers.getAllScrims); // GET
router.get('/scrims/today', controllers.getTodaysScrims); // GET
router.post('/scrims', controllers.createScrim); // POST
router.get('/scrims/:id', controllers.getScrimById); // GET
router.put('/scrims/:id', controllers.updateScrim); // PUT
router.put('/scrims/:id/add-image', controllers.addImageToScrim); // PUT
router.put('/scrims/:id/remove-image', controllers.removeImageFromScrim); // PUT

// PUT => Set all new attributes for an existing resource.
// PATCH => Partially update an existing resource (not all attributes required).
// patch because these routes add a subsidiary resource instead of completely replacing whatever is available.

router.patch(
  '/scrims/:scrimId/insert-player/:userId',
  controllers.insertPlayerInScrim
); // PATCH
router.patch('/scrims/:id/remove-player', controllers.removePlayerFromScrim); // PATCH
router.patch('/scrims/:id/move-player', controllers.movePlayerInScrim); // PATCH
router.patch('/scrims/:id/insert-caster', controllers.insertCasterInScrim); // PATCH
router.patch('/scrims/:id/remove-caster', controllers.removeCasterFromScrim); // PATCH
router.delete('/scrims/:id', controllers.deleteScrim); // DELETE

module.exports = router;
