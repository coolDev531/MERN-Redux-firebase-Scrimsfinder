const { Router } = require('express');
const controllers = require('../controllers/admin.controllers');
const admin = require('../middleware/admin');
const router = Router();

router.post('/admin/banUser', admin, controllers.banUser); // POST
router.post('/admin/unbanUser', admin, controllers.unbanUser); // POST

module.exports = router;
