import api from './api';
import type { Answer, AnswerCreate, AnswerUpdate, ContentBlock, RawContentBlock } from '../types';

/**
 * Determines if content is already in normalized format
 */
function isAlreadyNormalized(content: any[]): boolean {
  if (!Array.isArray(content) || content.length === 0) return false;
  const firstBlock = content[0];
  return firstBlock && 'data' in firstBlock && firstBlock.data !== undefined;
}

/**
 * Converts raw API response format to ContentBlock format if needed
 */
function normalizeAnswerContent(rawContent: any[]): ContentBlock[] {
  if (!rawContent || !Array.isArray(rawContent)) {
    return [];
  }
  
  // Если данные уже нормализованы, возвращаем как есть
  if (isAlreadyNormalized(rawContent)) {
    return rawContent as ContentBlock[];
  }
  
  // Иначе конвертируем старый формат в новый
  return rawContent.map((block: RawContentBlock) => {
    const normalizedBlock: ContentBlock = {
      type: block.type,
      data: {}
    };
    
    // Для каждого типа блока собираем данные в data
    if (block.type === 'code') {
      if (block.language) normalizedBlock.data!.language = block.language;
      if (block.content) normalizedBlock.data!.code = block.content;
    } else if (['heading', 'paragraph', 'info', 'warning'].includes(block.type)) {
      if (block.text) normalizedBlock.data!.text = block.text;
      else if (block.content) normalizedBlock.data!.text = block.content;
    } else if (block.type === 'image') {
      if (block.url) normalizedBlock.data!.url = block.url;
      if (block.alt) normalizedBlock.data!.alt = block.alt;
    }
    
    return normalizedBlock;
  });
}

export const answerService = {
  async getAnswers(
    questionId: string,
    pageNumber: number = 1,
    limit: number = 10,
    sortBy: string = 'created_at',
    sortDir: string = 'desc',
    is_published?: boolean,
  ): Promise<Answer[]> {
    const params = new URLSearchParams();
    params.append('page_number', pageNumber.toString());
    params.append('limit', limit.toString());
    params.append('sort_by', sortBy);
    params.append('sort_dir', sortDir);


    if (is_published !== undefined) {
      params.append('is_published', is_published.toString());
    }

    const response = await api.get(`/questions/${questionId}/answers/?${params.toString()}`);
    
    if (!Array.isArray(response.data)) {
      return [];
    }
    
    // Normalize the content structure only if needed
    return response.data.map((answer: any) => ({
      ...answer,
      content: Array.isArray(answer.content) 
        ? normalizeAnswerContent(answer.content)
        : [],
    }));
  },

  async getAnswer(questionId: string, answerId: string): Promise<Answer> {
    const response = await api.get(`/questions/${questionId}/answers/${answerId}`);
    
    // Нормализуем контент из ответа только если нужно
    if (response.data.content && Array.isArray(response.data.content)) {
      response.data.content = normalizeAnswerContent(response.data.content);
    }
    
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