// client/src/api/userApi.js
import api from './axiosConfig'; // This is your configured Axios instance

// Function to get all users (Admin only)
export const getAllUsers = async () => {
    const token = localStorage.getItem('token'); // Get token from local storage

    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }

    try {
        const response = await api.get('/api/users', {
            headers: {
                Authorization: `Bearer ${token}` // Attach the token for authorization
            }
        });
        return response.data; // The list of users
    } catch (error) {
        console.error('Error fetching all users:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Failed to fetch users');
    }
};

// Function to delete a user (Admin only) - This is for general user deletion
export const deleteUser = async (userId) => {
    const token = localStorage.getItem('token'); // Get token from local storage

    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }

    try {
        const response = await api.delete(`/api/users/${userId}`, { // DELETE request to /api/users/:userId
            headers: {
                Authorization: `Bearer ${token}` // Attach the token for authorization
            }
        });
        return response.data; // Typically a success message or confirmation
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error(`Failed to delete user ${userId}`);
    }
};

// Function to update a user (Admin only)
export const updateUser = async (userId, userData) => {
    const token = localStorage.getItem('token'); // Get token from local storage

    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }

    try {
        const response = await api.put(`/api/users/${userId}`, userData, { // PUT request to /api/users/:userId with userData
            headers: {
                Authorization: `Bearer ${token}`, // Attach the token for authorization
                'Content-Type': 'application/json' // Specify content type for the request body
            }
        });
        return response.data; // Typically the updated user object or a success message
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error(`Failed to update user ${userId}`);
    }
};

// --- NEW: Function to approve a user registration (Admin only) ---
export const approveUser = async (userId) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }

    try {
        const response = await api.put(`/api/auth/approve/${userId}`, {}, { // PUT request to new auth endpoint
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error approving user ${userId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error(`Failed to approve user ${userId}`);
    }
};

// --- NEW: Function to reject (delete) a user registration (Admin only) ---
export const rejectUser = async (userId) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }

    try {
        const response = await api.delete(`/api/auth/reject/${userId}`, { // DELETE request to new auth endpoint
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error rejecting user ${userId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error(`Failed to reject user ${userId}`);
    }
};