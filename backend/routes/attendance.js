const express = require('express');
const { punch, getAttendance, updateAttendance } = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.post('/punch', auth, punch);
router.get('/', auth, getAttendance);
router.put('/:id', auth, roleCheck('admin', 'hr'), updateAttendance);

module.exports = router;