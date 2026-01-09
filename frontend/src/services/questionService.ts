import api from './api';
import type { Question, QuestionCreate, QuestionUpdate, QuestionListResponse } from '../types';

export const questionService = {
  async getQuestions(
    pageNumber: number = 1,
    limit: number = 10,
    is_published?: boolean,
    difficulty?: string,
    category_id?: string,
    sortBy: string = 'created_at',
    sortDir: string = 'desc'
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

  async addCategoryToQuestion(questionId: string, categoryId: string): Promise<Question> {
    const response = await api.post(`/questions/${questionId}/categories/${categoryId}`);
    return response.data;
  },

  async removeCategoryFromQuestion(questionId: string, categoryId: string): Promise<Question> {
    const response = await api.delete(`/questions/${questionId}/categories/${categoryId}`);
    return response.data;
  },

  async setQuestionCategories(questionId: string, categoryIds: string[]): Promise<Question> {
    const response = await api.put(`/questions/${questionId}/categories/`, categoryIds);
    return response.data;
  },

  async getQuestionCategories(questionId: string) {
    const response = await api.get(`/questions/${questionId}/categories/`);
    return response.data;
  },
};
