const express = require('express');
const { protect, allowRoles } = require('../middleware/auth');
const ctrl = require('../controllers/maintenanceController');
const router = express.Router();

router.use(protect);
router.get('/', ctrl.list);
router.post('/start', allowRoles('Fleet Manager', 'Safety Officer'), ctrl.start);
router.patch('/:id/complete', allowRoles('Fleet Manager', 'Safety Officer'), ctrl.complete);

module.exports = router;
