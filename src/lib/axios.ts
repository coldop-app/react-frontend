import axios from 'axios';
import { API_URL } from './const';

const storeAdminAxiosClient = axios.create({
  baseURL: `${API_URL}/api/v1/base/store-admin`,
  withCredentials: true, // 🔥 IMPORTANT: allows cookies!
  timeout: 15000,
});

// Optional: Interceptors
storeAdminAxiosClient.interceptors.request.use(
  (config) => {
    // No need to attach token manually because you're using cookies!
    return config;
  },
  (error) => Promise.reject(error)
);

storeAdminAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized – maybe redirect to login');
    }
    return Promise.reject(error);
  }
);

export default storeAdminAxiosClient;
