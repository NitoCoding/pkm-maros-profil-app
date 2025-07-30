import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { getAuthToken } from '../auth/token';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api', // This will point to your Next.js API routes
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default api;