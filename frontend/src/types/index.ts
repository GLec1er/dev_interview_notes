export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  is_active: boolean;
  is_admin: boolean;
  last_login?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

// Question types
export interface Question {
  id: string;
  title: string;
  slug: string;
  content: any[];
  difficulty: 'easy' | 'medium' | 'hard';
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category_id?: string; // ID категории
  category?: Category;
  exclude_inactive_categories?: boolean,
}

export interface QuestionCreate {
  title: string;
  slug: string;
  content: any[];
  difficulty: 'easy' | 'medium' | 'hard';
  is_published: boolean;
  category_id: string;
}

export interface QuestionUpdate {
  title?: string;
  slug?: string;
  content?: any[];
  difficulty?: 'easy' | 'medium' | 'hard';
  is_published?: boolean;
  category_id?: string;
}

export interface QuestionListResponse {
  items: Question[];
  total: number;
}

// Answer types
export interface Answer {
  id: string;
  question_id: string;
  content: ContentBlock[];
  created_at?: string;
  updated_at?: string;
  is_published?: boolean;
}

export interface AnswerCreate {
  content: ContentBlock[];
}

export interface AnswerUpdate {
  content?: ContentBlock[];
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  question_count: number;
}

export interface CategoryCreate {
  name: string;
  slug: string;
  description?: string;
}

export interface CategoryUpdate {
  name?: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
}

// Content block types
export type ContentType = 'heading' | 'paragraph' | 'code' | 'info' | 'warning' | 'image';
export type ProgrammingLanguage = 'python' | 'sql' | 'bash' | 'html' | 'css' | 'json' | 'yaml' | 'markdown' | 'text' | 'other';

export interface ContentBlock {
  type: ContentType;
  data?: {
    text?: string;
    code?: string;
    language?: ProgrammingLanguage;
    url?: string;
    alt?: string;
  };
  order?: number;
}

// Raw content block from API (flat structure)
export interface RawContentBlock {
  type: ContentType;
  content?: string;
  text?: string;
  language?: ProgrammingLanguage;
  url?: string;
  alt?: string;
}

// API Response types
export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface PaginationParams {
  page_number?: number;
  limit?: number;
}

// Filter and Sort types
export interface QuestionFilters {
  is_published?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
}

export interface QuestionSort {
  sort_by?: string;
  order?: 'asc' | 'desc';
}
