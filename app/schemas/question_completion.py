from uuid import UUID
from pydantic import BaseModel


class CompletionResponse(BaseModel):
    """Ответ при отметке вопроса как выполненного."""
    success: bool
    message: str
    question_id: UUID
    user_id: UUID


class CompletionStatsResponse(BaseModel):
    """Статистика выполнения вопросов."""
    total: int
    total_completed: int
    total_easy: int
    easy_completed: int
    total_medium: int
    medium_completed: int
    total_hard: int
    hard_completed: int
    overall_percentage: float


class CategoryCompletionStats(BaseModel):
    """Статистика выполнения по категории."""
    category_id: str
    category_name: str
    completed_count: int
    total_count: int
    percentage: float


class CategoryCompletionStatsListResponse(BaseModel):
    """Список статистики выполнения по категориям."""
    items: list[CategoryCompletionStats]
