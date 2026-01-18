import type { FavoritesResponse } from '../types';
import api from './api';

export const favoriteService = {
  async addToFavorites(questionId: string): Promise<any> {
    const response = await api.post(`/questions/${questionId}/favorite`);
    return response.data;
  },

  async removeFromFavorites(questionId: string): Promise<any> {
    const response = await api.delete(`/questions/${questionId}/favorite`);
    return response.data;
  },

  async isFavorite(questionId: string): Promise<{ question_id: string; is_favorited: boolean }> {
    const response = await api.get(`/questions/${questionId}/is-favorited`);
    return response.data;
  },

  async getFavorites(
    pageNumber: number = 1,
    limit: number = 10,
    sortBy: string = 'added_at',
    sortDir: string = 'desc',
  ): Promise<FavoritesResponse> {
    const response = await api.get('/questions/favorites/list/', {
      params: {
        page_number: pageNumber,
        limit: limit,
        sort_by: sortBy,
        sort_dir: sortDir,
      },
    });
    return response.data;
  },
};

