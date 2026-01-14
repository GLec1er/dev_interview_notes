import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

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
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Если ошибка 401 и это не запрос на refresh
        if (error.response?.status === 401 && 
            !originalRequest?.url?.includes('/auth/refresh') &&
            !originalRequest?._retry) {
          
          // Если уже обновляем токен, ставим запрос в очередь
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ 
                resolve: (token: string) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(this.client(originalRequest));
                }, 
                reject 
              });
            });
          }

          // Помечаем запрос как повторяемый
          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { 
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                }
              }
            );

            // Получаем новый токен
            let newToken: string;
            if (typeof response.data === 'string') {
              newToken = response.data;
            } else if (response.data?.access_token) {
              newToken = response.data.access_token;
            } else {
              throw new Error('Invalid refresh response format');
            }

            // Сохраняем новый токен
            Cookies.set('access_token', newToken);

            // Обновляем заголовок для текущего запроса
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Обрабатываем очередь запросов
            this.failedQueue.forEach(({ resolve }) => resolve(newToken));
            this.failedQueue = [];

            // Повторяем оригинальный запрос
            return this.client(originalRequest);
          } catch (refreshError: any) {
            console.error('[API] Token refresh failed:', refreshError.message);
            
            // Очищаем очередь с ошибкой
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            
            // Очищаем токены
            Cookies.remove('access_token');
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
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
