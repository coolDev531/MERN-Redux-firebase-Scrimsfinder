const { Router } = require('express');
const controllers = require('../controllers/users');

const router = Router();

router.post('/users', controllers.createUser); // POST
router.get('/auth/log-in', controllers.loginUser); // GET

module.exports = router;
