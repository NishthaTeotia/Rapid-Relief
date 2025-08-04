import axios from './axiosConfig'; // Using axiosConfig for authenticated requests

const API_URL = '/api/help-requests'; // Base URL for help requests

// @desc    Get all public help/resource requests (for public display on HelpPage)
// @route   GET /api/help-requests/public
// @access  Public (no authentication required)
export const getPublicHelpRequests = async () => {
    try {
        const response = await axios.get(`${API_URL}/public`);
        return response.data;
    } catch (error) {
        console.error('Error fetching public help requests:', error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to fetch public help requests.';
    }
};

// @desc    Get all help/resource requests (Admin view)
// @access  Admin
export const getAllHelpRequests = async () => {
    try {
        const response = await axios.get(API_URL); // This route is protected on backend
        return response.data;
    } catch (error) {
        console.error('Error fetching all help requests:', error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to fetch help requests.';
    }
};

// @desc    Get help/resource requests relevant to the authenticated user (requested by or assigned to)
// @route   GET /api/help-requests/my
// @access  Private (Authenticated users: Public, Volunteer, NGO, Admin)
export const getMyHelpRequests = async () => { // NEW API CALL
    try {
        const response = await axios.get(`${API_URL}/my`);
        return response.data;
    } catch (error) {
        console.error('Error fetching my help requests:', error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to fetch my help requests.';
    }
};

// @desc    Get a single help/resource request by ID
// @access  Admin, Assigned Volunteer/NGO, or Requester
export const getHelpRequestById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching help request ${id}:`, error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to fetch help request.';
    }
};

// @desc    Create a new help/resource request
// @access  Authenticated users
export const createHelpRequest = async (requestData) => {
    try {
        const response = await axios.post(API_URL, requestData);
        return response.data;
    } catch (error) {
        console.error('Error creating help request:', error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to create help request.';
    }
};

// @desc    Update a help/resource request (general update for Admin or requester/assigned)
// @access  Admin or requester/assigned
export const updateHelpRequest = async (id, updatedData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating help request ${id}:`, error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to update help request.';
    }
};

// @desc    Update help/resource request status
// @access  Admin (or assigned user)
export const updateHelpRequestStatus = async (id, newStatus) => {
    try {
        const response = await axios.put(`${API_URL}/${id}/status`, { status: newStatus });
        return response.data;
    } catch (error) {
        console.error(`Error updating help request ${id} status:`, error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to update help request status.';
    }
};

// @desc    Assign a help/resource request to a Volunteer/NGO
// @access  Admin
export const assignHelpRequest = async (id, assigneeId) => {
    try {
        const response = await axios.put(`${API_URL}/${id}/assign`, { assigneeId });
        return response.data;
    } catch (error) {
        console.error(`Error assigning help request ${id}:`, error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to assign help request.';
    }
};

// @desc    Add/Update admin notes for a help/resource request
// @access  Admin
export const addHelpRequestAdminNotes = async (id, adminNotes) => {
    try {
        const response = await axios.put(`${API_URL}/${id}/notes`, { adminNotes });
        return response.data;
    } catch (error) {
        console.error(`Error adding admin notes for help request ${id}:`, error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to add admin notes.';
    }
};

// @desc    Delete a help/resource request
// @access  Admin
export const deleteHelpRequest = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting help request ${id}:`, error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to delete help request.';
    }
};


