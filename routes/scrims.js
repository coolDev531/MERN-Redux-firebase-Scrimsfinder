const { Router } = require('express');
const controllers = require('../controllers/scrims');

const router = Router();

router.get('/scrims', controllers.getAllScrims); // GET
router.get('/scrims/today', controllers.getTodaysScrims); // GET
router.post('/scrims', controllers.createScrim); // POST
router.get('/scrims/:id', controllers.getScrimById); // GET
router.put('/scrims/:id', controllers.updateScrim); // PUT
router.put('/scrims/:id/insert-player', controllers.insertPlayerInScrim); // PUT
router.put('/scrims/:id/remove-player', controllers.removePlayerFromScrim); // PUT
router.put('/scrims/:id/insert-caster', controllers.insertCasterInScrim); // PUT
router.put('/scrims/:id/remove-caster', controllers.removeCasterFromScrim); // PUT
router.delete('/scrims/:id', controllers.deleteScrim); // DELETE

module.exports = router;
