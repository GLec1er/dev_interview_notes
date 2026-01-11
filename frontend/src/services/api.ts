import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Don't retry refresh endpoint itself to avoid infinite loops
        if (originalRequest.url?.includes('/auth/refresh')) {
          // Refresh token expired or invalid, clear cookies and redirect to login
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Don't retry /auth/me on initial load to avoid infinite loops
        if (originalRequest.url?.includes('/auth/me') && !originalRequest._retry) {
          originalRequest._retry = true;

          // Check if we have a refresh token
          const refreshToken = Cookies.get('refresh_token');
          if (!refreshToken) {
            // No refresh token, can't refresh
            return Promise.reject(error);
          }

          try {
            // Try to refresh the token
            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const newToken = response.data;
            Cookies.set('access_token', newToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear cookies and redirect to login
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Check if we have a refresh token
          const refreshToken = Cookies.get('refresh_token');
          if (!refreshToken) {
            // No refresh token, redirect to login
            Cookies.remove('access_token');
            window.location.href = '/login';
            return Promise.reject(error);
          }

          try {
            // Try to refresh the token
            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const newToken = response.data;
            Cookies.set('access_token', newToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed (refresh token expired), clear cookies and redirect to login
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient.getInstance();
