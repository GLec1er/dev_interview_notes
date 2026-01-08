import api from './api';
import type { Answer, AnswerCreate, AnswerUpdate, ContentBlock, RawContentBlock } from '../types';

/**
 * Converts raw API response format to ContentBlock format
 * API returns: { type: "info", content: "text" }
 * We need: { type: "info", data: { content: "text" } }
 */
function normalizeAnswerContent(rawContent: RawContentBlock[]): ContentBlock[] {
  return rawContent.map((block) => {
    const data: any = {};
    
    // Copy all properties except 'type' to data object
    Object.keys(block).forEach((key) => {
      if (key !== 'type') {
        data[key] = (block as any)[key];
      }
    });
    
    return {
      type: block.type,
      data,
    };
  });
}

export const answerService = {
  async getAnswers(
    questionId: string,
    pageNumber: number = 1,
    limit: number = 10,
    sortBy: string = 'created_at',
    sortDir: string = 'desc'
  ): Promise<Answer[]> {
    const params = new URLSearchParams();
    params.append('page_number', pageNumber.toString());
    params.append('limit', limit.toString());
    params.append('sort_by', sortBy);
    params.append('sort_dir', sortDir);

    const response = await api.get(`/questions/${questionId}/answers/?${params.toString()}`);
    
    if (!Array.isArray(response.data)) {
      return [];
    }
    
    // Normalize the content structure
    return response.data.map((answer: any) => ({
      ...answer,
      content: Array.isArray(answer.content) 
        ? normalizeAnswerContent(answer.content)
        : [],
    }));
  },

  async getAnswer(questionId: string, answerId: string): Promise<Answer> {
    const response = await api.get(`/questions/${questionId}/answers/${answerId}`);
    return response.data;
  },

  async createAnswer(questionId: string, data: AnswerCreate): Promise<Answer> {
    const response = await api.post(`/questions/${questionId}/answers/`, data);
    return response.data;
  },

  async updateAnswer(questionId: string, answerId: string, data: AnswerUpdate): Promise<Answer> {
    const response = await api.put(`/questions/${questionId}/answers/${answerId}`, data);
    return response.data;
  },

  async deleteAnswer(questionId: string, answerId: string): Promise<void> {
    await api.delete(`/questions/${questionId}/answers/${answerId}`);
  },
};
