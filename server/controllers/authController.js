const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Helper function to generate a JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res) => {
    const { username, password, role } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    let initialIsApproved = true;
    if (role === 'Volunteer' || role === 'NGO') {
        initialIsApproved = false;
    }

    const user = await User.create({
        username,
        password,
        role: role || 'Public',
        isApproved: initialIsApproved,
        isBlocked: false,
        blockReason: ''
    });

    if (user) {
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            isApproved: user.isApproved,
            isBlocked: user.isBlocked,
            blockReason: user.blockReason,
            token: token,
            message: 'User registered successfully'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    if (user.isBlocked) {
        res.status(403);
        throw new Error(`Your account has been blocked. Reason: ${user.blockReason || 'No reason provided.'}`);
    }

    if (user.role !== 'Admin' && !user.isApproved) {
        res.status(403);
        throw new Error('Your account is pending approval. Please wait for an administrator to approve it.');
    }

    if (await user.matchPassword(password)) {
        const token = generateToken(user._id, user.role);

        res.json({
            _id: user._id, // This is correctly sent from backend
            username: user.username,
            role: user.role,
            isApproved: user.isApproved,
            isBlocked: user.isBlocked,
            blockReason: user.blockReason,
            token: token,
            message: 'Logged in successfully'
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Approve a user (set isApproved to true)
// @route   PUT /api/auth/approve/:id
// @access  Private/Admin
exports.approveUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const userToApprove = await User.findById(userId);

    if (!userToApprove) {
        res.status(404);
        throw new Error('User not found.');
    }

    if (userToApprove.role === 'Admin' || userToApprove.role === 'Public') {
        res.status(400);
        throw new Error('Only Volunteer and NGO roles require explicit approval.');
    }

    if (userToApprove.isApproved) {
        res.status(400);
        throw new Error('User is already approved.');
    }

    userToApprove.isApproved = true;
    await userToApprove.save();

    res.json({ message: `User '${userToApprove.username}' approved successfully.`, user: userToApprove });
});

// @desc    Reject a user (delete their account)
// @route   DELETE /api/auth/reject/:id
// @access  Private/Admin
exports.rejectUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
        res.status(404);
        throw new Error('User not found.');
    }

    if (userToDelete.role === 'Admin') {
        res.status(403);
        throw new Error('Cannot reject (delete) an Admin user via this interface.');
    }

    if (req.user && req.user.id === userId) {
        res.status(403);
        throw new Error('You cannot reject your own account.');
    }

    await User.deleteOne({ _id: userId });

    res.json({ message: `User '${userToDelete.username}' rejected and deleted successfully.` });
});

