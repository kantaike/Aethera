import axios, { AxiosHeaders } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'https://localhost:44336/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add language to every request based on saved preference
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const language = window.localStorage.getItem('language') || 'en';
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Accept-Language', language);
    config.headers = headers;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Could not access server';

    toast.error(`Error: ${message}`, {
      style: {
        background: '#1a1a1a',
        color: '#f4e4bc',
        border: '1px solid #b91c1c',
      },
    });

    // 401 handler must be placed here
    if (error.response?.status === 404) {
      console.error('Resource not found');
    }
    return Promise.reject(error);
  }
);

export default api;