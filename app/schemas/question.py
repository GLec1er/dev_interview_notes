from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field

from app.db.models.question import DifficultyQuestionLevel, Question
from app.schemas.base import SortMixin
from app.schemas.answer import AnswerResponse
from app.schemas.category import CategoryResponse


# ==================== Main Schemas ====================

class QuestionCreate(BaseModel):
    """Схема для создания вопроса."""
    title: str = Field(
        ..., 
        min_length=1, 
        max_length=500, 
        description="Заголовок вопроса",
    )
    slug: str = Field(
        ..., 
        min_length=1, 
        max_length=255, 
        description="Уникальный слаг",
    )
    content: List[Dict[str, Any]] = Field(
        ..., 
        description="Блоки контента",
    )
    difficulty: DifficultyQuestionLevel = Field(
        ..., 
        description="Уровень сложности",
    )
    is_published: bool = Field(
        False, 
        description="Опубликован ли вопрос",
    )
    category_id: UUID

    class Config:
        from_attributes = True


class QuestionResponse(BaseModel):
    """Схема для ответа с вопросом."""
    id: UUID
    title: str
    slug: str
    content: List[Dict[str, Any]]
    difficulty: DifficultyQuestionLevel
    is_published: bool
    category_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True


class QuestionListResponse(BaseModel):
    items: List[QuestionResponse]
    total: int


class QuestionUpdate(BaseModel):
    """Схема для обновления вопроса."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[List[Dict[str, Any]]] = None
    difficulty: Optional[DifficultyQuestionLevel] = None
    is_published: Optional[bool] = None
    category_id: UUID

    class Config:
        from_attributes = True


class QuestionUpdateResponse(BaseModel):
    """Схема для ответа с вопросом."""
    id: UUID
    title: str
    slug: str
    content: List[Dict[str, Any]]
    difficulty: DifficultyQuestionLevel
    is_published: bool
    category_id: UUID

    class Config:
        from_attributes = True


class QuestionDetailResponse(QuestionResponse):
    """Детальная схема вопроса с ответами."""
    answers: List[AnswerResponse] = []


# ============== Additional Schemas for Pagination and Sorting and Filtering ==============
    

class QuestionFilterParams(BaseModel):
    """Параметры фильтрации вопросов."""
    is_published: Optional[bool] = None
    difficulty: Optional[DifficultyQuestionLevel] = None
    category_id: Optional[UUID] = None

    # доп.фильтры
    exclude_inactive_categories: Optional[bool] = None
    
    def get_filters(self) -> Dict[str, Any]:
        """Получить словарь фильтров для SQLAlchemy."""
        filters = {}
        
        if self.is_published is not None:
            filters["is_published"] = self.is_published
        
        if self.difficulty is not None:
            filters["difficulty"] = self.difficulty.value
        
        if self.category_id is not None:
            filters["category_id"] = self.category_id

        if self.exclude_inactive_categories is not None:
            filters["exclude_inactive_categories"] = self.exclude_inactive_categories

        return filters
    

class QuestionSortParams(SortMixin):
    """Параметры сортировки вопросов."""
    sort_by: str = Field(
        "created_at", 
        description="Поле для сортировки",
    )
    
    @property
    def model(self):
        """Ссылка на модель вопроса."""
        return Question
