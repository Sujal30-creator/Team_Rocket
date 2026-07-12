const express = require('express');
const { protect, allowRoles } = require('../middleware/auth');
const ctrl = require('../controllers/vehicleController');
const router = express.Router();

router.use(protect);
router.get('/', ctrl.list);
router.post('/', allowRoles('Fleet Manager'), ctrl.create);
router.put('/:id', allowRoles('Fleet Manager'), ctrl.update);
router.delete('/:id', allowRoles('Fleet Manager'), ctrl.remove);

module.exports = router;
