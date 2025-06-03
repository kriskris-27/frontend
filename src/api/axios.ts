import axios from 'axios';

const api = axios.create({
    baseURL: 'https://thesis-server-wwmb.onrender.com/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Response from:', response.config.url, {
            status: response.status,
            headers: response.headers,
            cookies: document.cookie
        });
        return response;
    },
    (error) => {
        console.error('Response error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            cookies: document.cookie
        });

        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;