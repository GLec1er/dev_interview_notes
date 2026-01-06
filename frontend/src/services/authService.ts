import api from './api';
import type { User, UserCreate, UserLogin, UserUpdate } from '../types';

export const authService = {
  async register(data: UserCreate): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: UserLogin): Promise<User> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: UserUpdate): Promise<User> {
    const response = await api.put('/auth/me', data);
    return response.data;
  },

  async refreshToken(): Promise<string> {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};
