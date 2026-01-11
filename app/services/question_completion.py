"""Сервис для работы с отметками выполнения вопросов."""

from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.question import QuestionCompletion
from app.repositories.question_completion import QuestionCompletionRepository
from app.schemas.base import PaginationParams
from app.core.loggers import log


class QuestionCompletionService:
    """Сервис для работы с отметками выполнения вопросов."""

    def __init__(
        self, 
        repository: QuestionCompletionRepository,
    ):
        """Инициализация сервиса.
        
        Args:
            repository: Репозиторий отметок выполнения вопросов
        """
        self.repository = repository

    @classmethod
    def from_session(cls, session: AsyncSession) -> "QuestionCompletionService":
        """Создать сервис из сессии."""
        repository = QuestionCompletionRepository(session)
        return cls(repository)

    async def mark_question_complete(
        self, 
        user_id: UUID,
        question_id: UUID,
    ) -> Optional[QuestionCompletion]:
        """Отметить вопрос как выполненный.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            QuestionCompletion или None
            
        Raises:
            ValueError: Если пользователь или вопрос не найдены
        """
        try:
            completion = await self.repository.mark_question_complete(user_id, question_id)
            
            if completion:
                log.info(f"✅ Вопрос {question_id} отмечен как выполненный для пользователя {user_id}")
            
            return completion
        except Exception as e:
            log.error(f"❌ Ошибка при отметке вопроса как выполненного: {str(e)}")
            raise

    async def unmark_question_complete(
        self, 
        user_id: UUID,
        question_id: UUID,
    ) -> bool:
        """Снять отметку выполнения с вопроса.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            True если отметка была удалена, False если не найдена
        """
        try:
            deleted = await self.repository.unmark_question_complete(user_id, question_id)
            
            if deleted:
                log.info(f"✅ Отметка выполнения удалена для вопроса {question_id} пользователя {user_id}")
            else:
                log.warning(f"⚠️ Отметка выполнения не найдена для вопроса {question_id} пользователя {user_id}")
            
            return deleted
        except Exception as e:
            log.error(f"❌ Ошибка при удалении отметки выполнения: {str(e)}")
            raise

    async def is_question_completed(
        self, 
        user_id: UUID,
        question_id: UUID,
    ) -> bool:
        """Проверить, выполнен ли вопрос пользователем.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            True если вопрос выполнен, False иначе
        """
        try:
            is_completed = await self.repository.is_question_completed(user_id, question_id)
            return is_completed
        except Exception as e:
            log.error(f"❌ Ошибка при проверке выполнения вопроса: {str(e)}")
            raise

    async def get_user_completed_questions(
        self,
        user_id: UUID,
        pagination: Optional[PaginationParams] = None,
    ) -> tuple[List[QuestionCompletion], int]:
        """Получить список выполненных вопросов пользователя.
        
        Args:
            user_id: UUID пользователя
            pagination: Параметры пагинации
            
        Returns:
            Кортеж (список выполненных вопросов, общее количество)
        """
        try:
            completions, total = await self.repository.get_user_completed_questions(
                user_id, 
                pagination,
            )
            
            log.debug(f"📖 Получено {len(completions)} выполненных вопросов для пользователя {user_id}")
            return completions, total
        except Exception as e:
            log.error(f"❌ Ошибка при получении выполненных вопросов: {str(e)}")
            raise

    async def get_user_completion_stats(
        self,
        user_id: UUID,
    ) -> Dict[str, Any]:
        """Получить статистику выполнения вопросов пользователем.
        
        Args:
            user_id: UUID пользователя
            
        Returns:
            Словарь со статистикой
        """
        try:
            stats = await self.repository.get_user_completion_stats(user_id)
            
            log.debug(f"📊 Получена статистика выполнения для пользователя {user_id}")
            return stats
        except Exception as e:
            log.error(f"❌ Ошибка при получении статистики выполнения: {str(e)}")
            raise

    async def get_user_completion_stats_by_category(
        self,
        user_id: UUID,
    ) -> List[Dict[str, Any]]:
        """Получить статистику выполнения вопросов по категориям.
        
        Args:
            user_id: UUID пользователя
            
        Returns:
            Список словарей со статистикой по категориям
        """
        try:
            stats = await self.repository.get_user_completion_stats_by_category(user_id)
            
            log.debug(f"📊 Получена статистика по категориям для пользователя {user_id}")
            return stats
        except Exception as e:
            log.error(f"❌ Ошибка при получении статистики по категориям: {str(e)}")
            raise

    async def get_overall_completion_percentage(
        self,
        user_id: UUID,
    ) -> float:
        """Получить общий процент выполнения вопросов.
        
        Args:
            user_id: UUID пользователя
            
        Returns:
            Процент выполнения (0-100)
        """
        try:
            percentage = await self.repository.get_overall_completion_percentage(user_id)
            
            log.debug(f"📊 Общий процент выполнения для пользователя {user_id}: {percentage:.2f}%")
            return percentage
        except Exception as e:
            log.error(f"❌ Ошибка при получении общего процента выполнения: {str(e)}")
            raise
