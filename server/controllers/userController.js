const User = require('../models/User'); // Import the User model
const asyncHandler = require('express-async-handler'); // Import asyncHandler for consistent error handling

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password'); // Fetch all users, exclude password field
    res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
exports.getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password'); // Fetch user by ID, exclude password
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user);
});

// @desc    Update user details (including role, approval, block status)
// @route   PUT /api/users/:id
// @access  Admin
exports.updateUser = asyncHandler(async (req, res) => {
    const { username, role, isApproved, isBlocked, blockReason } = req.body; // Add new fields
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent updating password through this general update route
    if (req.body.password) {
        res.status(400);
        throw new Error('Password cannot be updated via this route.');
    }

    // Prevent an admin from blocking/deactivating themselves
    if (req.user && req.user.id === id && (isBlocked === true || isApproved === false)) {
        res.status(403);
        throw new Error('Admin cannot block or deactivate their own account.');
    }

    // Check if role is valid if provided
    if (role && !['Admin', 'NGO', 'Volunteer', 'Public'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role provided.');
    }

    // Update fields if provided in the request body
    user.username = username || user.username;
    user.role = role || user.role;

    // Handle isApproved status
    if (typeof isApproved === 'boolean') { // Ensure it's a boolean
        user.isApproved = isApproved;
    }

    // Handle isBlocked status and blockReason
    if (typeof isBlocked === 'boolean') { // Ensure it's a boolean
        user.isBlocked = isBlocked;
        // If unblocking, clear the block reason
        if (isBlocked === false) {
            user.blockReason = '';
        } else {
            // If blocking, set the reason (allow empty string for no specific reason)
            user.blockReason = blockReason !== undefined ? blockReason : user.blockReason;
        }
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
        isBlocked: updatedUser.isBlocked,
        blockReason: updatedUser.blockReason,
        message: 'User updated successfully'
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent an admin from deleting themselves through this interface
    if (req.user && req.user.id === req.params.id) {
        res.status(403);
        throw new Error('Admin cannot delete their own account via this interface.');
    }

    await user.deleteOne(); // Use deleteOne()
    res.json({ message: 'User removed successfully' });
});
