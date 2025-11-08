const express = require('express');
const { simulatePayrun, commitPayrun, getPayrun, getPayslips, downloadPayslipPDF, getAnalytics } = require('../controllers/payrollController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.post('/payrun/simulate', auth, roleCheck('admin', 'payroll'), simulatePayrun);
router.post('/payrun/:id/commit', auth, roleCheck('admin', 'payroll'), commitPayrun);
router.get('/payrun/:id', auth, getPayrun);
router.get('/payslips', auth, getPayslips);
router.get('/payslips/:id/download', auth, downloadPayslipPDF);
router.get('/analytics', auth, roleCheck('admin', 'hr', 'payroll'), getAnalytics);

module.exports = router;