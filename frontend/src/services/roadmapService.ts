import api from './api';

export interface RoadmapItem {
  id: string;
  roadmap_id: string;
  category_id: string;
  question_ids?: string[];
  order: number;
  created_at: string;
  updated_at: string;
  // Новые поля для вопроса
  question?: {
    id: string;
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category_id: string;
    created_at: string;
    updated_at: string;
  };
}

export interface RoadmapListResponse {
  id: string;
  title: string;
  slug: string;
  profession: string;
  description?: string;
  is_active: boolean;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface RoadmapResponse extends RoadmapListResponse {
  roadmap_items: RoadmapItem[];
}

export interface RoadmapQuestionItem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  category_id?: string;
  is_completed?: boolean;
}

export interface RoadmapDetailResponse extends RoadmapListResponse {
  items: RoadmapQuestionItem[];
}

export interface RoadmapCreate {
  title: string;
  profession: string;
  description?: string;
  is_active?: boolean;
}

export interface RoadmapUpdate {
  title?: string;
  profession?: string;
  description?: string;
  is_active?: boolean;
}

export interface RoadmapItemCreate {
  question_ids: string[];
  order: number;
  category_id?: string;
}

export interface RoadmapItemUpdate {
  question_ids?: string[];
  order?: number;
  category_id?: string;
}

export type RoadmapDetail = RoadmapDetailResponse;

class RoadmapService {
  /**
   * Получить список всех активных роадмапов
   */
  async getAllRoadmaps(): Promise<RoadmapListResponse[]> {
    try {
      const response = await api.get<RoadmapListResponse[]>('/roadmaps/');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении роадмапов:', error);
      throw error;
    }
  }

  /**
   * Получить список всех профессий
   */
  async getProfessions(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/roadmaps/professions');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении профессий:', error);
      throw error;
    }
  }

  /**
   * Получить роадмапы по профессии
   */
  async getRoadmapsByProfession(profession: string): Promise<RoadmapResponse[]> {
    try {
      const response = await api.get<RoadmapResponse[]>(
        `/roadmaps/profession/${encodeURIComponent(profession)}`
      );
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении роадмапов для профессии "${profession}":`, error);
      throw error;
    }
  }

  /**
   * Получить детали роадмапа по slug
   */
  async getRoadmapBySlug(slug: string): Promise<RoadmapResponse> {
    try {
      const response = await api.get<RoadmapResponse>(`/roadmaps/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении роадмапа "${slug}":`, error);
      throw error;
    }
  }

  /**
   * Получить детали роадмапа с вопросами по slug
   */
  async getRoadmapDetailBySlug(slug: string): Promise<RoadmapDetailResponse> {
    try {
      const response = await api.get<RoadmapDetailResponse>(`/roadmaps/${slug}/detail`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении деталей роадмапа "${slug}":`, error);
      throw error;
    }
  }

  /**
   * Создать новый роадмап
   */
  async createRoadmap(data: RoadmapCreate): Promise<RoadmapResponse> {
    try {
      const response = await api.post<RoadmapResponse>('/roadmaps/', data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании роадмапа:', error);
      throw error;
    }
  }

  /**
   * Обновить роадмап
   */
  async updateRoadmap(id: string, data: RoadmapUpdate): Promise<RoadmapResponse> {
    try {
      const response = await api.put<RoadmapResponse>(`/roadmaps/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении роадмапа "${id}":`, error);
      throw error;
    }
  }

  /**
   * Удалить роадмап
   */
  async deleteRoadmap(id: string): Promise<void> {
    try {
      await api.delete(`/roadmaps/${id}`);
    } catch (error) {
      console.error(`Ошибка при удалении роадмапа "${id}":`, error);
      throw error;
    }
  }

  /**
   * Добавить элемент в роадмап
   */
  async addRoadmapItem(roadmapId: string, data: RoadmapItemCreate): Promise<RoadmapItem> {
    try {
      const response = await api.post<RoadmapItem>(`/roadmaps/${roadmapId}/items`, data);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при добавлении элемента в роадмап "${roadmapId}":`, error);
      throw error;
    }
  }

  /**
   * Обновить элемент роадмапа
   */
  async updateRoadmapItem(itemId: string, data: any): Promise<RoadmapItem> {
    try {
      const response = await api.put<RoadmapItem>(`/roadmaps/items/${itemId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении элемента роадмапа "${itemId}":`, error);
      throw error;
    }
  }

  /**
   * Удалить элемент роадмапа
   */
  async deleteRoadmapItem(itemId: string): Promise<void> {
    try {
      await api.delete(`/roadmaps/items/${itemId}`);
    } catch (error) {
      console.error(`Ошибка при удалении элемента роадмапа "${itemId}":`, error);
      throw error;
    }
  }
}

export const roadmapService = new RoadmapService();