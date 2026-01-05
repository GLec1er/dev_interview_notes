from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class CategoryBase(BaseModel):
    """Базовая схема категории."""
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=100, 
        description="Название категории",
    )
    description: Optional[str] = Field(
        None, 
        description="Описание категории",
    )
    slug: str = Field(
        ..., 
        min_length=1, 
        max_length=100, 
        description="Уникальный слаг категории",
    )
    is_active: bool = Field(
        default=True, 
        description="Активна ли категория",
    )

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: str) -> str:
        """Валидация слага."""
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Слаг может содержать только буквы, цифры, дефисы и подчеркивания')
        return v.lower()


class CategoryCreate(CategoryBase):
    """Схема для создания категории."""
    pass


class CategoryUpdate(BaseModel):
    """Схема для обновления категории."""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Название категории")
    description: Optional[str] = Field(None, description="Описание категории")
    slug: Optional[str] = Field(None, min_length=1, max_length=100, description="Уникальный слаг категории")
    is_active: Optional[bool] = Field(None, description="Активна ли категория")

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        """Валидация слага."""
        if v is None:
            return v
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Слаг может содержать только буквы, цифры, дефисы и подчеркивания')
        return v.lower()


class CategoryResponse(CategoryBase):
    """Схема для ответа с категорией."""
    id: UUID
    question_count: Optional[int] = Field(None, description="Количество вопросов в категории")

    class Config:
        from_attributes = True


class CategoryListResponse(BaseModel):
    """Схема для списка категорий."""
    items: List[CategoryResponse]
    total: int
