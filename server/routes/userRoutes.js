// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Import the user controller
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import middleware

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
router.get('/', protect, authorizeRoles('Admin'), userController.getAllUsers);

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
router.get('/:id', protect, authorizeRoles('Admin'), userController.getUserById);

// @desc    Update user details (including role)
// @route   PUT /api/users/:id
// @access  Admin
router.put('/:id', protect, authorizeRoles('Admin'), userController.updateUser);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
router.delete('/:id', protect, authorizeRoles('Admin'), userController.deleteUser);

module.exports = router;