const express = require('express');
const { protect, allowRoles } = require('../middleware/auth');
const ctrl = require('../controllers/driverController');
const router = express.Router();

router.use(protect);
router.get('/', ctrl.list);
router.post('/search', ctrl.search);
router.post('/', allowRoles('Fleet Manager', 'Safety Officer'), ctrl.create);
router.put('/:id', allowRoles('Fleet Manager', 'Safety Officer'), ctrl.update);
router.delete('/:id', allowRoles('Fleet Manager'), ctrl.remove);

module.exports = router;
