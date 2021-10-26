const { Router } = require('express');
const controllers = require('../controllers/auth.controllers');
const auth = require('../middleware/auth');
const router = Router();

router.post('/auth/login', controllers.loginUser); // POST
router.post('/auth/register', controllers.registerUser); // POST
router.post('/auth/verify', controllers.verifyUser); // POST
router.put('/auth/update-user', auth, controllers.updateUser); // PUT

module.exports = router;
