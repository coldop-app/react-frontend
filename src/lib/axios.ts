import axios from 'axios';
import { API_URL } from './const';
import { useStore } from '@/stores/store';

const storeAdminAxiosClient = axios.create({
  baseURL: `${API_URL}/api/v1/base`,
  timeout: 15000,
});

// Request interceptor to add Authorization header
storeAdminAxiosClient.interceptors.request.use(
  (config) => {
    // Get token from store
    const token = useStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
storeAdminAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on unauthorized
      const { clearAdminData } = useStore.getState();
      clearAdminData();
      // Redirect to login if not already there
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default storeAdminAxiosClient;
