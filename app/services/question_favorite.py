"""Сервис для работы с избранными вопросами."""

from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.question import QuestionFavorite
from app.repositories.question_favorite import QuestionFavoriteRepository
from app.schemas.base import PaginationParams
from app.core.loggers import log


class QuestionFavoriteService:
    """Сервис для работы с избранными вопросами."""

    def __init__(
        self, 
        repository: QuestionFavoriteRepository,
    ):
        """Инициализация сервиса.
        
        Args:
            repository: Репозиторий избранных вопросов
        """
        self.repository = repository

    @classmethod
    def from_session(cls, session: AsyncSession) -> "QuestionFavoriteService":
        """Создать сервис из сессии."""
        repository = QuestionFavoriteRepository(session)
        return cls(repository)

    async def add_to_favorites(
        self, 
        user_id: UUID,
        question_id: UUID,
    ) -> Optional[QuestionFavorite]:
        """Добавить вопрос в избранное.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            QuestionFavorite или None
            
        Raises:
            ValueError: Если пользователь или вопрос не найдены
        """
        try:
            favorite = await self.repository.add_to_favorites(user_id, question_id)
            
            if favorite:
                log.info(f"✅ Вопрос {question_id} добавлен в избранное для пользователя {user_id}")
            
            return favorite
        except Exception as e:
            log.error(f"❌ Ошибка при добавлении вопроса в избранное: {str(e)}")
            raise

    async def remove_from_favorites(
        self, 
        user_id: UUID,
        question_id: UUID,
    ) -> bool:
        """Удалить вопрос из избранного.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            True если удалено, False если не было в избранном
        """
        try:
            deleted = await self.repository.remove_from_favorites(user_id, question_id)
            
            if deleted:
                log.info(f"✅ Вопрос {question_id} удален из избранного пользователя {user_id}")
            else:
                log.warning(f"⚠️ Вопрос {question_id} не был в избранном пользователя {user_id}")
            
            return deleted
        except Exception as e:
            log.error(f"❌ Ошибка при удалении вопроса из избранного: {str(e)}")
            raise

    async def is_question_favorited(
        self, 
        user_id: UUID,
        question_id: UUID,
    ) -> bool:
        """Проверить, находится ли вопрос в избранном у пользователя.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            True если вопрос в избранном, False иначе
        """
        try:
            is_favorited = await self.repository.is_question_favorited(user_id, question_id)
            return is_favorited
        except Exception as e:
            log.error(f"❌ Ошибка при проверке избранного вопроса: {str(e)}")
            raise

    async def get_user_favorite_questions(
        self,
        user_id: UUID,
        pagination: Optional[PaginationParams] = None,
    ) -> tuple[List[QuestionFavorite], int]:
        """Получить список избранных вопросов пользователя.
        
        Args:
            user_id: UUID пользователя
            pagination: Параметры пагинации
            
        Returns:
            Кортеж (список избранных вопросов, общее количество)
        """
        try:
            favorites, total = await self.repository.get_user_favorite_questions(
                user_id, 
                pagination,
            )
            
            log.debug(f"📖 Получено {len(favorites)} избранных вопросов для пользователя {user_id}")
            return favorites, total
        except Exception as e:
            log.error(f"❌ Ошибка при получении избранных вопросов: {str(e)}")
            raise
