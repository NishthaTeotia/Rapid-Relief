require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Node.js built-in HTTP module
const { Server } = require('socket.io'); // Socket.IO Server class
const cors = require('cors');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const helpRequestsRouter = require('./routes/helpRequests'); // Correct import: directly imports the router

// Import error handling middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app

// Socket.IO setup (CORS config for Socket.IO is separate)
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// CRUCIAL: Attach Socket.IO instance to Express app for access in routes/controllers
app.set('io', io); // Now accessible via req.app.get('io')

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json()); // For parsing application/json

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// --- FIX: Use helpRequestsRouter directly, as it no longer accepts 'io' as an argument ---
app.use('/api/help-requests', helpRequestsRouter);

// Basic route for testing server status
app.get('/', (req, res) => {
    res.send('Rapid Relief API is running!');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Socket.IO: User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Socket.IO: User disconnected: ${socket.id}`);
    });

    socket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message);
    });
});

// Error handling middleware (MUST be after routes)
app.use(notFound); // Handles 404 Not Found errors
app.use(errorHandler); // Handles all other errors and formats responses

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
