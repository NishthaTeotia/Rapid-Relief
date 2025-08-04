// server/middleware/errorMiddleware.js

// Middleware to handle 404 Not Found errors
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass the error to the next error-handling middleware
};

// Middleware to handle general errors
const errorHandler = (err, req, res, next) => {
    // Determine the status code: if a status code was already set by a previous middleware/controller, use it. Otherwise, default to 500 (Server Error).
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Send a JSON response with the error message and stack trace (only in development)
    res.json({
        message: err.message, // The error message
        // Include stack trace only if in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        // If the error object itself has specific properties (like isBlocked, blockReason), include them
        isBlocked: err.isBlocked, // This will be present if the error came from authController for blocked users
        blockReason: err.blockReason // This will be present if the error came from authController for blocked users
    });
};

module.exports = {
    notFound,
    errorHandler
};
