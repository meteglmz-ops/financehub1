import axios from 'axios';
import { auth } from '../firebaseConfig';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds timeout for AI generation
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
    async (config) => {
        if (auth && auth.currentUser) {
            const token = await auth.currentUser.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            const user = localStorage.getItem('user');
            if (user) {
                config.headers.Authorization = `Bearer mock-token`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            // For now, we just reject the promise
            console.error('Unauthorized access - redirecting to login...');
        }
        return Promise.reject(error);
    }
);

export default api;
