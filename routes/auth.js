const { Router } = require('express');
const controllers = require('../controllers/auth');

const router = Router();

router.post('/auth/login', controllers.loginUser); // POST
router.post('/auth/register', controllers.registerUser); // POST
router.post('/auth/verify', controllers.verifyUser); // POST

module.exports = router;
