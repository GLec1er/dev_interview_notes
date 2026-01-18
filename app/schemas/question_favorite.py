"""Схемы для избранных вопросов."""

from uuid import UUID
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FavoriteResponse(BaseModel):
    """Ответ при добавлении/удалении вопроса из избранного."""
    success: bool
    message: str
    question_id: UUID
    user_id: UUID


class IsFavoritedResponse(BaseModel):
    """Ответ при проверке наличия вопроса в избранном."""
    question_id: UUID
    is_favorited: bool


class FavoriteQuestionInfo(BaseModel):
    """Информация об избранном вопросе."""
    favorite_id: UUID
    question_id: UUID
    question_title: str
    question_difficulty: Optional[str]
    user_id: UUID
    added_at: datetime

    class Config:
        from_attributes = True


class UserFavoritesListResponse(BaseModel):
    """Ответ со списком избранных вопросов пользователя."""
    items: list[FavoriteQuestionInfo]
    total: int


class FavoritesCountResponse(BaseModel):
    """Ответ с количеством избранных вопросов."""
    user_id: UUID
    favorites_count: int
