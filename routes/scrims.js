const { Router } = require('express');
const controllers = require('../controllers/scrims');
const apiKey = require('../utils/apiKey');

const router = Router();

router.get('/scrims', apiKey, controllers.getAllScrims); // GET
router.post('/scrims', apiKey, controllers.createScrim); // POST
router.get('/scrims/:id', apiKey, controllers.getScrimById); // GET
router.put('/scrims/:id', apiKey, controllers.updateScrim); // PUT
router.put(
  '/scrims/:id/insert-player',
  apiKey,
  controllers.insertPlayerInScrim
); // PUT
router.put(
  '/scrims/:id/remove-player',
  apiKey,
  controllers.removePlayerFromScrim
); // PUT
router.put(
  '/scrims/:id/insert-caster',
  apiKey,
  controllers.insertCasterInScrim
); // PUT
router.put(
  '/scrims/:id/remove-caster',
  apiKey,
  controllers.removeCasterFromScrim
); // PUT
router.delete('/scrims/:id', apiKey, controllers.deleteScrim); // DELETE

module.exports = router;
