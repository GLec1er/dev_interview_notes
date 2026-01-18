"""Репозитории для работы с БД."""

from app.repositories.question import QuestionRepository
from app.repositories.answer import AnswerRepository
from app.repositories.question_completion import QuestionCompletionRepository
from app.repositories.question_favorite import QuestionFavoriteRepository

__all__ = [
    "QuestionRepository",
    "AnswerRepository",
    "QuestionCompletionRepository",
    "QuestionFavoriteRepository",
]
