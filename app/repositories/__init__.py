"""Репозитории для работы с БД."""

from app.repositories.question import QuestionRepository
from app.repositories.answer import AnswerRepository

__all__ = [
    "QuestionRepository",
    "AnswerRepository",
]
