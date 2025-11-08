const express = require('express');
const { getDashboardStats, getRecentActivity } = require('../controllers/dashboardController');
const { rbacAuth } = require('../middleware/rbac');

const router = express.Router();

router.get('/stats', rbacAuth(['dashboard:read']), getDashboardStats);
router.get('/activity', rbacAuth(['dashboard:read']), getRecentActivity);

module.exports = router;