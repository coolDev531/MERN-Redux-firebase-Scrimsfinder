const { Router } = require('express');
const controllers = require('../controllers/scrims');

const router = Router();

router.get('/scrims', controllers.getAllScrims); // GET
router.get('/scrims/today', controllers.getTodaysScrims); // GET
router.post('/scrims', controllers.createScrim); // POST
router.get('/scrims/:id', controllers.getScrimById); // GET
router.put('/scrims/:id', controllers.updateScrim); // PUT
router.put('/scrims/:id/add-image', controllers.addImageToScrim); // PUT

// PUT => Set all new attributes for an existing resource.
// PATCH => Partially update an existing resource (not all attributes required).
// patch because these routes add a subsidiary resource instead of completely replacing whatever is available.
router.patch('/scrims/:id/insert-player', controllers.insertPlayerInScrim); // POST
router.patch('/scrims/:id/remove-player', controllers.removePlayerFromScrim); // POST
router.patch('/scrims/:id/insert-caster', controllers.insertCasterInScrim); // POST
router.patch('/scrims/:id/remove-caster', controllers.removeCasterFromScrim); // POST
router.delete('/scrims/:id', controllers.deleteScrim); // DELETE

module.exports = router;
