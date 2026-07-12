const express = require('express');
const { protect, allowRoles } = require('../middleware/auth');
const ctrl = require('../controllers/tripController');
const router = express.Router();

router.use(protect);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/dispatch', allowRoles('Fleet Manager'), ctrl.dispatch);
router.patch('/:id/finish', allowRoles('Fleet Manager'), ctrl.finish);
router.put('/:id', allowRoles('Fleet Manager'), ctrl.update);
router.delete('/:id', allowRoles('Fleet Manager'), ctrl.remove);

module.exports = router;
