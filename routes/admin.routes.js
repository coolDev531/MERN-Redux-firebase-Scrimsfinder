const { Router } = require('express');
const controllers = require('../controllers/admin.controllers');
const admin = require('../middleware/admin');
const router = Router();

router.get('/admin/all-bans-history', admin, controllers.getAllBans); // GET
router.post('/admin/banUser', admin, controllers.banUser); // POST
router.post('/admin/unbanUser', admin, controllers.unbanUser); // POST
router.post('/admin/updateUser/:userId', admin, controllers.updateUserAsAdmin); // POST

module.exports = router;
