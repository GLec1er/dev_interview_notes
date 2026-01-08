import api from './api';
import type { Category, CategoryCreate, CategoryUpdate, CategoryListResponse } from '../types';

export const categoryService = {
  async getCategories(
    pageNumber: number = 1,
    limit: number = 10,
    includeInactive: boolean = false
  ): Promise<CategoryListResponse> {
    const params = new URLSearchParams();
    params.append('page_number', pageNumber.toString());
    params.append('limit', limit.toString());
    params.append('include_inactive', includeInactive.toString());

    const response = await api.get(`/questions/categories/?${params.toString()}`);
    return response.data;
  },

  async getCategory(categoryId: string): Promise<Category> {
    const response = await api.get(`/questions/categories/${categoryId}`);
    return response.data;
  },

  async createCategory(data: CategoryCreate): Promise<Category> {
    const response = await api.post('/questions/categories/', data);
    return response.data;
  },

  async updateCategory(categoryId: string, data: CategoryUpdate): Promise<Category> {
    const response = await api.put(`/questions/categories/${categoryId}`, data);
    return response.data;
  },

  async deleteCategory(categoryId: string): Promise<void> {
    await api.delete(`/questions/categories/${categoryId}`);
  },
};
