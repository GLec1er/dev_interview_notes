import api from './api';
import type { User, UserUpdate } from '../types';

export interface UserListResponse {
  items: User[];
  total: number;
}

export const userService = {
  async getUsers(
    pageNumber: number = 1,
    limit: number = 10,
    sortBy: string = 'created_at',
    sortDir: string = 'desc',
  ): Promise<UserListResponse> {
    const params = new URLSearchParams();
    params.append('page_number', pageNumber.toString());
    params.append('limit', limit.toString());
    params.append('sort_by', sortBy);
    params.append('sort_dir', sortDir);

    const response = await api.get(`/users/?${params.toString()}`);
    return response.data;
  },

  async getUser(userId: string): Promise<User> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  async updateUser(userId: string, data: UserUpdate): Promise<User> {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },

  async toggleUserActive(userId: string, isActive: boolean): Promise<User> {
    const response = await api.put(`/users/${userId}`, { is_active: isActive });
    return response.data;
  },
};
