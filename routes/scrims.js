const { Router } = require('express');
const controllers = require('../controllers/scrims');

const router = Router();

router.get('/scrims', controllers.getAllScrims); // GET
router.post('/scrims', controllers.createScrim); // POST
router.get('/scrims/:id', controllers.getScrimById); // GET
router.put('/scrims/:id', controllers.updateScrim); // PUT
router.delete('/users/:id', controllers.deleteScrim); // DELETE

module.exports = router;
