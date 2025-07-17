// client/src/utils/socket.js
import { io } from 'socket.io-client';

// Get the backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Create a Socket.IO client instance
const socket = io(BACKEND_URL, {
    // You can add options here if needed, e.g., for authentication headers
    // auth: { token: 'yourAuthToken' } // If you ever add authentication
});

// Optional: Add basic connection status logging
socket.on('connect', () => {
    console.log('Socket.IO connected:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
});

socket.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err.message);
});

export default socket;