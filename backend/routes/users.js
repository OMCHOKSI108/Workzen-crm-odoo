const express = require('express');
const { getUsers, updateUserRole, updateUserPermissions } = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', auth, roleCheck('admin'), getUsers);
router.put('/:id/role', auth, roleCheck('admin'), updateUserRole);
router.put('/:id/permissions', auth, roleCheck('admin'), updateUserPermissions);

module.exports = router;
