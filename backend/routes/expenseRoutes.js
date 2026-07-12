const express = require('express');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/expenseController');
const router = express.Router();

router.use(protect);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/trip/:tripId/total', ctrl.tripTotal);

module.exports = router;
