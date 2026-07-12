const express = require('express');
const { register, login, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
