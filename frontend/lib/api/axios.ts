import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    // Try to get token from cookies first
    let token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('sis-token='))
      ?.split('=')[1];

    // Fallback to localStorage (used by vanilla HTML frontend)
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('sis_token') || undefined;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
