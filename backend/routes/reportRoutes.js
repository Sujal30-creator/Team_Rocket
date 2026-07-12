const express = require('express');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/reportController');
const router = express.Router();

router.use(protect);
router.get('/dashboard', ctrl.dashboardSummary);
router.get('/utilization', ctrl.fleetUtilization);
router.get('/cost', ctrl.operationalCost);

module.exports = router;
