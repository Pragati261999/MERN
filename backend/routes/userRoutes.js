const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deactivateUser
} = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);
router.delete('/profile', auth, deactivateUser);

// Admin only routes
router.get('/users', auth, authorize('admin'), getAllUsers);
router.patch('/users/:userId/role', auth, authorize('admin'), updateUserRole);

module.exports = router; 