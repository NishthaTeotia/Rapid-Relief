// client/src/api/volunteersApi.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchVolunteers = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/volunteers`);
        return response; // response.data will be the array directly
    } catch (error) {
        console.error('Error fetching volunteers:', error.response?.data || error.message);
        throw error;
    }
};

export const fetchVolunteerById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/api/volunteers/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching volunteer ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const registerVolunteer = async (volunteerData) => {
    try {
        const response = await axios.post(`${API_URL}/api/volunteers`, volunteerData);
        return response.data;
    } catch (error) {
        console.error('Error registering volunteer:', error.response?.data || error.message);
        throw error;
    }
};

export const updateVolunteer = async (id, updatedData) => {
    try {
        const response = await axios.put(`${API_URL}/api/volunteers/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating volunteer ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteVolunteer = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/api/volunteers/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting volunteer ${id}:`, error.response?.data || error.message);
        throw error;
    }
};