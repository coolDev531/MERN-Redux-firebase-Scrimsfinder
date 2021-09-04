const { Router } = require('express');
const controllers = require('../controllers/users');

const router = Router();

router.get('/users', controllers.getAllUsers); // GET
router.get('/users/:id', controllers.getUserById); // GET
router.post('/users', controllers.createUser); // POST
router.put('/users/:id', controllers.updateUser); // PUT

module.exports = router;
