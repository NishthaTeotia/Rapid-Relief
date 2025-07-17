// client/src/api/helpRequestsApi.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchHelpRequests = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/help-requests`);
        return response; // response.data will be the array directly
    } catch (error) {
        console.error('Error fetching help requests:', error.response?.data || error.message);
        throw error;
    }
};

export const fetchHelpRequestById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/api/help-requests/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching help request ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createHelpRequest = async (requestData) => {
    try {
        const response = await axios.post(`${API_URL}/api/help-requests`, requestData);
        return response.data;
    } catch (error) {
        console.error('Error creating help request:', error.response?.data || error.message);
        throw error;
    }
};

export const updateHelpRequestStatus = async (id, newStatus) => {
    try {
        const response = await axios.put(`${API_URL}/api/help-requests/${id}/status`, { status: newStatus });
        return response.data;
    } catch (error) {
        console.error(`Error updating help request ${id} status:`, error.response?.data || error.message);
        throw error;
    }
};

export const updateHelpRequest = async (id, updatedData) => {
    try {
        const response = await axios.put(`${API_URL}/api/help-requests/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating help request ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteHelpRequest = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/api/help-requests/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting help request ${id}:`, error.response?.data || error.message);
        throw error;
    }
};