import axios from 'axios';

export const API_BASE_URL = 'https://meals4-all.onrender.com';
// export const API_BASE_URL = 'http://localhost:5001';
// export const API_BASE_URL = 'http://192.168.1.120:5001';
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests and handle FormData content type
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let axios set the correct Content-Type with boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth and redirect if we have a token (meaning it's invalid/expired)
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect based on current path
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else if (currentPath.startsWith('/vendor')) {
          window.location.href = '/vendor/login';
        } else if (currentPath.startsWith('/user')) {
          window.location.href = '/user/login';
        } else {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

