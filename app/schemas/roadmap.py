"""Schemas для работы с roadmaps."""

from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class RoadmapItemCreate(BaseModel):
    """Схема для создания элемента roadmap."""
    
    question_ids: List[str] = Field(..., description="Список ID вопросов")
    order: int = Field(default=1, description="Порядок элемента")
    category_id: Optional[UUID] = Field(None, description="ID категории (опционально)")


class RoadmapItemUpdate(BaseModel):
    """Схема для обновления элемента roadmap."""
    
    category_id: Optional[UUID] = Field(None, description="ID категории")
    question_ids: Optional[List[str]] = Field(None, description="Список ID вопросов")
    order: Optional[int] = Field(None, description="Порядок элемента")


class RoadmapItemResponse(BaseModel):
    """Схема ответа для элемента roadmap."""
    
    id: UUID
    roadmap_id: UUID
    category_id: UUID
    question_ids: Optional[List[str]]
    order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapCreate(BaseModel):
    """Схема для создания roadmap."""
    
    title: str = Field(..., min_length=1, max_length=255, description="Название дорожной карты")
    profession: str = Field(..., min_length=1, max_length=100, description="Профессия/специальность")
    description: Optional[str] = Field(None, max_length=5000, description="Описание дорожной карты")
    roadmap_items: List[RoadmapItemCreate] = Field(default_factory=list, description="Элементы дорожной карты")


class RoadmapUpdate(BaseModel):
    """Схема для обновления roadmap."""
    
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Название")
    profession: Optional[str] = Field(None, min_length=1, max_length=100, description="Профессия")
    description: Optional[str] = Field(None, description="Описание")
    is_active: Optional[bool] = Field(None, description="Активна ли дорожная карта")


class RoadmapResponse(BaseModel):
    """Полный ответ для roadmap."""
    
    id: UUID
    title: str
    slug: str
    profession: str
    description: Optional[str]
    is_active: bool
    roadmap_items: List[RoadmapItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapListResponse(BaseModel):
    """Ответ с списком roadmaps."""
    
    id: UUID
    title: str
    slug: str
    profession: str
    description: Optional[str]
    is_active: bool
    items_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
