const { Router } = require('express');
const controllers = require('../controllers/auth');

const router = Router();

router.post('/auth/verify', controllers.verifyUser); // POST
router.post('/auth/login', controllers.loginUser); // POST
router.post('/auth/register', controllers.registerUser); // POST

module.exports = router;
