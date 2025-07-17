// client/src/api/reportsApi.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Function to fetch all reports
export const fetchReports = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/reports`);
        return response; // response.data will be the array directly
    } catch (error) {
        console.error('Error fetching reports:', error.response?.data || error.message);
        throw error;
    }
};

// Function to fetch a single report by ID
export const fetchReportById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/api/reports/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching report ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// Function to create a new report
export const createReport = async (reportData) => {
    try {
        const response = await axios.post(`${API_URL}/api/reports`, reportData);
        return response.data;
    } catch (error) {
        console.error('Error creating report:', error.response?.data || error.message);
        throw error;
    }
};

// Function to update an existing report (e.g., status, details)
export const updateReport = async (id, updatedData) => {
    try {
        const response = await axios.put(`${API_URL}/api/reports/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating report ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// Function to add a comment to a report
export const addReportComment = async (reportId, commentText) => {
    try {
        const response = await axios.post(`${API_URL}/api/reports/${reportId}/comments`, { text: commentText });
        return response.data; // Should return the new comment or updated report
    } catch (error) {
        console.error(`Error adding comment to report ${reportId}:`, error.response?.data || error.message);
        throw error;
    }
};

// Function to delete a report
export const deleteReport = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/api/reports/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting report ${id}:`, error.response?.data || error.message);
        throw error;
    }
};