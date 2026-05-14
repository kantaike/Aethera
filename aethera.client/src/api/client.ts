import axios, { AxiosHeaders } from 'axios';
import toast from 'react-hot-toast';
import { getStoredLanguage, translations } from '../i18n/translations';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add language and auth token to every request based on saved preference and session state.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const language = window.localStorage.getItem('language') || 'en';
    const token = useAuthStore.getState().token;
    const headers = AxiosHeaders.from(config.headers);

    headers.set('Accept-Language', language);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    config.headers = headers;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const language = getStoredLanguage();
    const t = translations.api.errors[language];
    const message = error.response?.data?.message || t.defaultMessage;

    toast.error(`${t.prefix}: ${message}`, {
      style: {
        background: '#1a1a1a',
        color: '#f4e4bc',
        border: '1px solid #b91c1c',
      },
    });

    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }

    if (error.response?.status === 404) {
      console.error(t.notFound);
    }
    return Promise.reject(error);
  }
);

export default api;