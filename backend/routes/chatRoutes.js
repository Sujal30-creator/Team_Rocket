const express = require('express');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/chatbotController');
const router = express.Router();

router.use(protect);
router.post('/', ctrl.chat);

module.exports = router;
