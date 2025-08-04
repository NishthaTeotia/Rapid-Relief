import axios from './axiosConfig';

export const loginUser = async (username, password) => {
    try {
        const response = await axios.post('/api/auth/login', { username, password });
        return response.data;
    } catch (error) {
        console.error('Login API error:', error.response?.data || error.message);
        // --- NEW: Propagate the full error response data for specific handling in AuthContext ---
        if (error.response && error.response.data) {
            // If the backend sends specific error data (like for blocked users), throw that.
            // This allows AuthContext to check for `isBlocked` and `blockReason`.
            throw error.response.data;
        } else {
            // Fallback for network errors or unexpected responses
            throw new Error(error.message || 'Login failed. Please check credentials.');
        }
        // --- END NEW ---
    }
};

export const registerUser = async (username, password, role = 'Public') => {
    try {
        const response = await axios.post('/api/auth/register', { username, password, role });
        return response.data;
    } catch (error) {
        console.error('Registration API error:', error.response?.data || error.message);
        // Propagate the full error response data or a detailed message.
        if (error.response && error.response.data) {
             // Prioritize detailedMessage from backend validation errors, then general message
            const errorMessage = error.response.data.detailedMessage || error.response.data.message;
            throw new Error(errorMessage || 'Registration failed.'); // Always throw an Error object
        } else {
            throw new Error(error.message || 'Registration failed.');
        }
    }
};

