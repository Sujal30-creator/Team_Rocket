const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

function signToken(id, rememberMe) {
  // If rememberMe is true, expire in 30 days, else 1 day.
  const expiresIn = rememberMe ? '30d' : '1d';
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id, true);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    const token = signToken(user._id, rememberMe);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name)  updates.name  = name.trim();
    if (email) updates.email = email.toLowerCase().trim();

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Provide current password and a new password (min 6 chars).' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email address.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Note: User needs to provide EMAIL_USER and EMAIL_PASS in .env
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: 'FleetForge <noreply@fleetforge.com>',
      to: user.email,
      subject: 'Password Reset Token',
      html: `<p>You requested a password reset. Please click the link below to reset your password. This link is valid for 10 minutes.</p>
             <a href="${resetUrl}">${resetUrl}</a>`
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Token sent to email!' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error(err);
      return res.status(500).json({ message: 'There was an error sending the email. Ensure EMAIL_USER and EMAIL_PASS are set in backend .env' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = signToken(user._id, true);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
