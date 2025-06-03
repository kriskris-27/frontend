import axios from 'axios';

const api = axios.create({
    baseURL: 'https://thesis-server-wwmb.onrender.com/api',
    withCredentials: true
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url, {
            withCredentials: config.withCredentials,
            headers: config.headers,
            cookies: document.cookie
        });
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => {
        // Log successful response
        console.log('Response received:', {
            url: response.config.url,
            status: response.status,
            headers: response.headers,
            cookies: document.cookie
        });
        return response;
    },
    (error) => {
        // Log error details
        console.error('Response error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            cookies: document.cookie
        });
        return Promise.reject(error);
    }
);

export default api;