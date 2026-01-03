from typing import Dict, Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.db.models.question import Answer
from app.schemas.base import SortMixin


class AnswerCreate(BaseModel):
    """Схема для создания ответа."""
    content: List[Dict[str, Any]] = Field(..., description="Блоки контента ответа")

    class Config:
        from_attributes = True


class AnswerUpdate(BaseModel):
    """Схема для обновления ответа."""
    content: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True


class AnswerResponse(BaseModel):
    """Схема для ответа с ответом."""
    id: UUID
    question_id: UUID
    content: List[Dict[str, Any]]

    class Config:
        from_attributes = True


# ============== Additional Schemas for Pagination and Sorting and Filtering ==============
    

class AnswerFilterParams(BaseModel):
    """Параметры фильтрации ответов."""
    pass
    
    def get_filters(self) -> Dict[str, Any]:
        """Получить словарь фильтров для SQLAlchemy."""
        filters = {}
        
        return filters
    

class AnswerSortParams(SortMixin):
    """Параметры сортировки ответов."""
    sort_by: str = Field(
        "created_at", 
        description="Поле для сортировки",
    )
    
    @property
    def model(self):
        """Ссылка на модель вопроса."""
        return Answer
