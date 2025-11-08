const express = require('express');
const { getEmployees, getEmployee, createEmployee, updateEmployee, updateProfile, updateSalaryConfig } = require('../controllers/employeeController');
const { rbacAuth, requireHR, requireAdmin, validateSelfAccess } = require('../middleware/rbac');

const router = express.Router();

router.get('/', rbacAuth(['employees:read']), getEmployees);
router.get('/:id', rbacAuth(['employees:read']), validateSelfAccess, getEmployee);
router.post('/', requireHR, createEmployee);
router.put('/:id', requireHR, updateEmployee);
router.put('/:id/profile', rbacAuth(['profile:write']), validateSelfAccess, updateProfile);
router.put('/:id/salary', rbacAuth(['payroll:write']), updateSalaryConfig);

module.exports = router;