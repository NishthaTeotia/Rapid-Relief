import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Helper to get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Create an Axios instance with base URL and default headers
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the Authorization token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- API Functions for Reports ---

// @desc    Get all reports (Admin only)
export const getAllReports = async () => {
    try {
        const response = await axiosInstance.get('/api/reports');
        return response.data;
    } catch (error) {
        console.error('Error fetching all reports (Admin access):', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to fetch all reports';
    }
};

// @desc    Get public reports (for public display on ReportsPage)
// @route   GET /api/reports/public
// @access  Public (no authentication required)
export const getPublicReports = async () => {
    try {
        const response = await axiosInstance.get('/api/reports/public');
        return response.data;
    } catch (error) {
        console.error('Error fetching public reports:', error.response?.data?.message || error.message);
        throw error.response?.data?.message || 'Failed to fetch public reports.';
    }
};


// @desc    Get reports relevant to the authenticated user (submitted by or assigned to)
// @route   GET /api/reports/my
export const getMyReports = async () => {
    try {
        const response = await axiosInstance.get('/api/reports/my');
        return response.data;
    } catch (error) {
        console.error('Error fetching my reports:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to fetch my reports';
    }
};

// @desc    Get a single report by ID (Admin or reporter or assigned user)
export const getReportById = async (reportId) => {
    try {
        const response = await axiosInstance.get(`/api/reports/${reportId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching report ${reportId}:`, error.response?.data || error.message);
        throw error.response?.data?.message || `Failed to fetch report ${reportId}`;
    }
};

// @desc    Create a new report (Any logged-in user)
export const createReport = async (reportData) => {
    try {
        const response = await axiosInstance.post('/api/reports', reportData);
        return response.data;
    } catch (error) {
        console.error('Error creating report:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to create report';
    }
};

// @desc    Update an existing report (General update, can be used by admin, reporter, or assigned user)
export const updateReport = async (reportId, updatedData) => {
    try {
        const response = await axiosInstance.put(`/api/reports/${reportId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating report ${reportId}:`, error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to update report';
    }
};

// @desc    Update a report's status (Admin or assigned user)
export const updateReportStatus = async (reportId, newStatus) => {
    try {
        const response = await axiosInstance.put(`/api/reports/status/${reportId}`, { status: newStatus });
        return response.data;
    } catch (error) {
        console.error(`Error updating report ${reportId} status to ${newStatus}:`, error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to update report status';
    }
};

// @desc    Assign a report to a user (Admin only)
export const assignReport = async (reportId, assignedToId) => {
    try {
        const response = await axiosInstance.put(`/api/reports/assign/${reportId}`, { assignedToId });
        return response.data;
    } catch (error) {
        console.error(`Error assigning report ${reportId} to ${assignedToId}:`, error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to assign report';
    }
};

// @desc    Add/Update admin notes for a report (Admin only)
export const addAdminNotes = async (reportId, adminNotes) => {
    try {
        const response = await axiosInstance.put(`/api/reports/notes/${reportId}`, { adminNotes });
        return response.data;
    } catch (error) {
        console.error(`Error adding admin notes to report ${reportId}:`, error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to add admin notes';
    }
};

// @desc    Delete a report (Admin only)
export const deleteReport = async (reportId) => {
    try {
        const response = await axiosInstance.delete(`/api/reports/${reportId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting report ${reportId}:`, error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to delete report';
    }
};
