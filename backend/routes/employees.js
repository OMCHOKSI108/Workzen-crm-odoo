const express = require('express');
const { getEmployees, getEmployee, createEmployee, updateEmployee, updateProfile, updateSalaryConfig } = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', auth, getEmployees);
router.get('/:id', auth, getEmployee);
router.post('/', auth, roleCheck('admin', 'hr'), createEmployee);
router.put('/:id', auth, roleCheck('admin', 'hr'), updateEmployee);
router.put('/:id/profile', auth, updateProfile);
router.put('/:id/salary', auth, roleCheck('admin', 'payroll'), updateSalaryConfig);

module.exports = router;