const express = require('express');
const { punch, getAttendance, updateAttendance } = require('../controllers/attendanceController');
const { rbacAuth, requireHR } = require('../middleware/rbac');

const router = express.Router();

router.post('/punch', rbacAuth(['attendance:write']), punch);
router.get('/', rbacAuth(['attendance:read']), getAttendance);
router.put('/:id', requireHR, updateAttendance);

module.exports = router;