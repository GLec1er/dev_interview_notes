import api from './api';
import type { Question, QuestionCreate, QuestionUpdate, QuestionListResponse } from '../types';

export const questionService = {
  async getQuestions(
    pageNumber: number = 1,
    limit: number = 10,
    is_published?: boolean,
    difficulty?: string,
    sortBy: string = 'created_at',
    sortDir: string = 'desc',
    category_id?: string,
    exclude_inactive_categories?: boolean,
    is_completed?: boolean,
  ): Promise<QuestionListResponse> {
    const params = new URLSearchParams();
    params.append('page_number', pageNumber.toString());
    params.append('limit', limit.toString());
    params.append('sort_by', sortBy);
    params.append('sort_dir', sortDir);

    if (is_published !== undefined) {
      params.append('is_published', is_published.toString());
    }
    if (difficulty) {
      params.append('difficulty', difficulty);
    }
    if (category_id) {
      params.append('category_id', category_id);
    }
    if (exclude_inactive_categories !== undefined) {
      params.append('exclude_inactive_categories', exclude_inactive_categories.toString());
    }
    if (is_completed !== undefined) {
      params.append('is_completed', is_completed.toString());
    }

    const response = await api.get(`/questions/?${params.toString()}`);
    return response.data;
  },

  async getQuestion(questionId: string): Promise<Question> {
    const response = await api.get(`/questions/${questionId}`);
    return response.data;
  },

  async createQuestion(data: QuestionCreate): Promise<Question> {
    const response = await api.post('/questions/', data);
    return response.data;
  },

  async updateQuestion(questionId: string, data: QuestionUpdate): Promise<Question> {
    const response = await api.put(`/questions/${questionId}`, data);
    return response.data;
  },

  async deleteQuestion(questionId: string): Promise<void> {
    await api.delete(`/questions/${questionId}`);
  },
};
