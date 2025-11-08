const express = require('express');
const { getLeaves, getPendingLeaves, createLeave, approveLeave } = require('../controllers/leaveController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', auth, getLeaves);
router.get('/pending', auth, roleCheck('admin', 'hr'), getPendingLeaves);
router.post('/', auth, createLeave);
router.post('/:id/approve', auth, roleCheck('admin', 'hr'), approveLeave);

module.exports = router;