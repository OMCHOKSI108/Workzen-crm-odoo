const express = require('express');
const { getLeaves, getPendingLeaves, createLeave, approveLeave } = require('../controllers/leaveController');
const { rbacAuth, requireHR } = require('../middleware/rbac');

const router = express.Router();

router.get('/', rbacAuth(['leaves:read']), getLeaves);
router.get('/pending', requireHR, getPendingLeaves);
router.post('/', rbacAuth(['leaves:write']), createLeave);
router.post('/:id/approve', requireHR, approveLeave);

module.exports = router;