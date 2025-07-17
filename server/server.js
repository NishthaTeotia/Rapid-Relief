// server/server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Node.js built-in HTTP module
const { Server } = require('socket.io'); // Socket.IO Server class
const cors = require('cors');

// Import controllers directly
const reportsController = require('./src/controllers/reportsController');
// const helpRequestsController = require('./src/controllers/helpRequestsController'); // This import might become redundant or change how you pass `io`
const volunteersController = require('./src/controllers/volunteersController');

// IMPORT THE ROUTER MODULE
const helpRequestsRouter = require('./src/routes/helpRequests'); // Correct path for the router

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app

// Socket.IO setup
const io = new Server(server, {
 cors: {
origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
 methods: ["GET", "POST", "PUT", "DELETE"]
 }
});

// Export the Socket.IO instance so it can be used in other controller files (if needed, but usually passed)
exports.io = io; // You can keep this for other controllers that might still use it directly

// Middleware
app.use(cors({
 origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
 .then(() => console.log('MongoDB connected successfully'))
 .catch(err => console.error('MongoDB connection error:', err));

// Define API routes directly using controllers
// Reports Routes
app.get('/api/reports', reportsController.getReports);
app.get('/api/reports/:id', reportsController.getReportById);
app.post('/api/reports', (req, res) => reportsController.createReport(req, res, io));
app.put('/api/reports/:id', (req, res) => reportsController.updateReport(req, res, io));
app.post('/api/reports/:id/comments', (req, res) => reportsController.addComment(req, res, io));
app.delete('/api/reports/:id', (req, res) => reportsController.deleteReport(req, res, io));

// Help Requests Routes - Use the dedicated router here!
// Pass the `io` instance to the router factory function
app.use('/api/help-requests', helpRequestsRouter(io)); // <--- THIS IS THE FIX for help requests

// Volunteers Routes
app.get('/api/volunteers', volunteersController.getVolunteers);
app.post('/api/volunteers', volunteersController.registerVolunteer);
app.put('/api/volunteers/:id', volunteersController.updateVolunteer);
app.delete('/api/volunteers/:id', volunteersController.deleteVolunteer);

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

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});