import api from './api';

export const questionCompletionService = {
  async markQuestionComplete(questionId: string): Promise<any> {
    const response = await api.post(`/questions/${questionId}/complete`);
    return response.data;
  },

  async unmarkQuestionComplete(questionId: string): Promise<any> {
    const response = await api.delete(`/questions/${questionId}/complete`);
    return response.data;
  },

  async isQuestionCompleted(questionId: string): Promise<{ question_id: string; is_completed: boolean }> {
    const response = await api.get(`/questions/${questionId}/is-completed`);
    return response.data;
  },

  async getCompletionStats(): Promise<{
    total_completed: number;
    easy_completed: number;
    medium_completed: number;
    hard_completed: number;
    overall_percentage: number;
  }> {
    const response = await api.get('/questions/completion/stats');
    return response.data;
  },

  async getCompletionStatsByCategory(): Promise<{
    items: Array<{
      category_id: string;
      category_name: string;
      completed_count: number;
      total_count: number;
      percentage: number;
    }>;
  }> {
    const response = await api.get('/questions/completion/stats-by-category');
    return response.data;
  },
};
