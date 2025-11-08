const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { rbacAuth } = require('../middleware/rbac');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', rbacAuth(['profile:read']), getMe);

module.exports = router;