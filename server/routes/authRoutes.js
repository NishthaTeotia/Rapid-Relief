// server/routes/authRoutes.js
const express = require('express');
// --- Updated Imports (Critical Fix for TypeError) ---
const { registerUser, loginUser, approveUser, rejectUser } = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // <--- THIS LINE MUST BE authorizeRoles
// --- End Updated Imports ---

const router = express.Router();

// Route for user registration
// POST /api/auth/register
router.post('/register', registerUser);

// Route for user login
// POST /api/auth/login
router.post('/login', loginUser);

// --- NEW Admin-only Routes for User Approval/Rejection ---
// @desc    Approve a user by ID
// @route   PUT /api/auth/approve/:id
// @access  Private/Admin
router.put('/approve/:id', protect, authorizeRoles('Admin'), approveUser); // <--- MUST USE authorizeRoles

// @desc    Reject (delete) a user by ID
// @route   DELETE /api/auth/reject/:id
// @access  Private/Admin
router.delete('/reject/:id', protect, authorizeRoles('Admin'), rejectUser); // <--- MUST USE authorizeRoles
// --- END NEW Routes ---

module.exports = router;