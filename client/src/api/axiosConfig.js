import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
    timeout: 10000,
    withCredentials: true, // Crucial if your backend relies on cookies/sessions for auth
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptors to attach the auth token
instance.interceptors.request.use(
    config => {
        // Retrieve the token from localStorage
        const token = localStorage.getItem('token'); // Assuming your token is stored as 'token'

        // If a token exists, add it to the Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Optional: Add response interceptors (like in your axiosInstance.js)
instance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        // Example: Handle global errors like 401 Unauthorized
        // You might want to redirect to login or show a global error message here
        // if (error.response && error.response.status === 401) {
        //     console.warn('Unauthorized request detected by axios interceptor. User might be logged out or token expired.');
        //     // Optionally, clear token and redirect to login
        //     // localStorage.removeItem('token');
        //     // window.location.href = '/login'; // Or use a more sophisticated method with React Router
        // }
        return Promise.reject(error);
    }
);

export default instance;

