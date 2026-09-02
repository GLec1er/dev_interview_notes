"""Schemas для работы с компаниями."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class CompanyBase(BaseModel):
    """Базовая схема компании."""
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=200, 
        description="Название компании",
    )
    level: str = Field(
        None,
        min_length=1,
        max_length=100,
    )
    slug: str = Field(
        ..., 
        min_length=1, 
        max_length=255, 
        description="Уникальный слаг компании",
    )
    description: Optional[str] = Field(
        None, 
        description="Описание компании",
    )
    logo_url: Optional[str] = Field(
        None,
        max_length=500,
        description="URL логотипа компании",
    )
    is_active: bool = Field(
        default=True, 
        description="Активна ли компания",
    )

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: str) -> str:
        """Валидация слага."""
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Слаг может содержать только буквы, цифры, дефисы и подчеркивания')
        return v.lower()


class CompanyCreate(CompanyBase):
    """Схема для создания компании."""
    pass


class CompanyUpdate(BaseModel):
    """Схема для обновления компании."""
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Название компании")
    slug: Optional[str] = Field(None, min_length=1, max_length=255, description="Уникальный слаг компании")
    description: Optional[str] = Field(None, description="Описание компании")
    logo_url: Optional[str] = Field(None, max_length=500, description="URL логотипа компании")
    is_active: Optional[bool] = Field(None, description="Активна ли компания")

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        """Валидация слага."""
        if v is not None and not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Слаг может содержать только буквы, цифры, дефисы и подчеркивания')
        return v.lower() if v else v

    class Config:
        from_attributes = True


class CompanyResponse(CompanyBase):
    """Схема для ответа с компанией."""
    id: UUID | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanyWithQuestionsResponse(CompanyResponse):
    """Схема компании с количеством вопросов."""
    questions_count: int = 0
    completed_questions_count: int = 0

    class Config:
        from_attributes = True


class CompanyListResponse(BaseModel):
    """Схема для списка компаний."""
    total: int
    page: int
    page_size: int
    items: List[CompanyWithQuestionsResponse]
