import axios from 'axios';

// Create axios instance with specific configuration for cross-origin requests
const api = axios.create({
    baseURL: 'https://thesis-server-wwmb.onrender.com/api',
    withCredentials: true, // Required for cookies
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // Add these options for better cross-origin handling
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    // Ensure credentials are included
    withXSRFToken: true
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Ensure withCredentials is always true
        config.withCredentials = true;
        
        // Log detailed request information
        console.log('Making request to:', config.url, {
            method: config.method,
            withCredentials: config.withCredentials,
            headers: {
                ...config.headers,
                origin: window.location.origin,
                referer: window.location.href
            },
            cookies: document.cookie,
            sameSite: 'none', // Expected from server
            secure: true,     // Expected from server
            crossOrigin: true // We expect this to be cross-origin
        });

        // Add additional headers that might help with CORS
        config.headers['Access-Control-Allow-Credentials'] = 'true';
        
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
        // Log detailed response information
        console.log('Response from:', response.config.url, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                ...response.headers,
                'access-control-allow-origin': response.headers['access-control-allow-origin'],
                'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
                'set-cookie': response.headers['set-cookie']
            },
            cookies: document.cookie,
            // Check if CORS headers are present
            hasCorsHeaders: {
                allowOrigin: !!response.headers['access-control-allow-origin'],
                allowCredentials: !!response.headers['access-control-allow-credentials'],
                hasSetCookie: !!response.headers['set-cookie']
            }
        });
        return response;
    },
    (error) => {
        // Log detailed error information
        console.error('Response error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: {
                ...error.response?.headers,
                'access-control-allow-origin': error.response?.headers?.['access-control-allow-origin'],
                'access-control-allow-credentials': error.response?.headers?.['access-control-allow-credentials'],
                'set-cookie': error.response?.headers?.['set-cookie']
            },
            cookies: document.cookie,
            // Check if it's a CORS error
            isCorsError: error.message === 'Network Error' && !error.response,
            // Check CORS headers
            hasCorsHeaders: {
                allowOrigin: !!error.response?.headers?.['access-control-allow-origin'],
                allowCredentials: !!error.response?.headers?.['access-control-allow-credentials'],
                hasSetCookie: !!error.response?.headers?.['set-cookie']
            }
        });

        if (error.response?.status === 401) {
            // Check if it's a cookie issue
            const hasCookies = document.cookie.length > 0;
            console.log('Auth failed. Cookies present:', hasCookies, {
                cookies: document.cookie,
                headers: error.response?.headers,
                isCorsError: error.message === 'Network Error'
            });
            
            // Clear any local auth state
            localStorage.removeItem('user');
            
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Add a function to check cookie support
const checkCookieSupport = () => {
    const testCookie = 'testCookie=test; SameSite=None; Secure';
    document.cookie = testCookie;
    const hasCookie = document.cookie.includes('testCookie');
    document.cookie = 'testCookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    return hasCookie;
};

// Log cookie support status
console.log('Cookie support status:', {
    cookiesEnabled: navigator.cookieEnabled,
    canSetCookies: checkCookieSupport(),
    currentCookies: document.cookie
});

export default api;