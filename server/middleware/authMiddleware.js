// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // For handling async errors gracefully
const User = require('../models/User'); // Import the User model

// Middleware to protect routes (ensure user is authenticated)
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if token exists in headers and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (e.g., "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the user (excluding password) to the request object
            // This makes req.user available in subsequent middleware/route handlers
            req.user = await User.findById(decoded.id).select('-password');

            // Ensure user exists (e.g., if user was deleted after token was issued)
            if (!req.user) {
                res.status(401); // Unauthorized
                throw new Error('Not authorized, user not found');
            }

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('Error in authentication middleware:', error);
            res.status(401).json({ message: 'Not authorized, token failed or invalid' }); // Unauthorized
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' }); // Unauthorized
    }
});

// Middleware to authorize users based on roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user is set by the 'protect' middleware, which must run before this one
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Not authorized, no user role found' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Forbidden: User role '${req.user.role}' is not authorized to access this route` }); // Forbidden
        }
        next(); // User has the required role, proceed
    };
};

module.exports = { protect, authorizeRoles };