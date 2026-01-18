"""Репозиторий для работы с избранными вопросами."""

from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy import func, select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.db.models.question_utils import QuestionFavorite
from app.core.loggers import log
from app.repositories.base import BaseRepository
from app.schemas.base import PaginationParams


class QuestionFavoriteRepository(
    BaseRepository[
        QuestionFavorite, 
        dict, 
        dict
    ]
):
    """Репозиторий для работы с избранными вопросами в БД."""

    def __init__(self, session: AsyncSession):
        super().__init__(QuestionFavorite, session)
    
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
            Объект QuestionFavorite или None если уже в избранном
        """
        try:
            # Проверяем, не в избранном ли уже вопрос
            existing = await self.get_favorite(user_id, question_id)
            if existing:
                log.warning(f"⚠️ Вопрос {question_id} уже в избранном у пользователя {user_id}")
                return existing
            
            # Создаем новую запись
            favorite = QuestionFavorite(
                user_id=user_id,
                question_id=question_id,
            )
            self.session.add(favorite)
            await self.session.flush()
            
            log.info(f"✅ Вопрос {question_id} добавлен в избранное для пользователя {user_id}")
            return favorite
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при добавлении вопроса в избранное: {e}")
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
            stmt = delete(QuestionFavorite).where(
                (QuestionFavorite.user_id == user_id) &
                (QuestionFavorite.question_id == question_id)
            )
            result = await self.session.execute(stmt)
            
            if result.rowcount > 0:
                log.info(f"✅ Вопрос {question_id} удален из избранного пользователя {user_id}")
                return True
            else:
                log.warning(f"⚠️ Вопрос {question_id} не был в избранном пользователя {user_id}")
                return False
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при удалении вопроса из избранного: {e}")
            raise

    async def get_favorite(
        self,
        user_id: UUID,
        question_id: UUID,
    ) -> Optional[QuestionFavorite]:
        """Получить запись избранного вопроса.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            Объект QuestionFavorite или None
        """
        try:
            stmt = select(QuestionFavorite).where(
                (QuestionFavorite.user_id == user_id) &
                (QuestionFavorite.question_id == question_id)
            )
            result = await self.session.execute(stmt)
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при получении записи избранного: {e}")
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
            favorite = await self.get_favorite(user_id, question_id)
            return favorite is not None
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при проверке избранного вопроса: {e}")
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
            # Получаем избранные вопросы
            stmt = select(QuestionFavorite).where(
                QuestionFavorite.user_id == user_id
            ).order_by(
                QuestionFavorite.added_at.desc()
            ).options(
                selectinload(QuestionFavorite.question)
            )
            
            # Считаем общее количество
            count_stmt = select(func.count()).where(
                QuestionFavorite.user_id == user_id
            )
            
            total = 0
            if pagination:
                # Получаем общее количество
                count_result = await self.session.execute(count_stmt)
                total = count_result.scalar_one() or 0
                
                # Применяем пагинацию
                stmt = stmt.offset((pagination.page_number - 1) * pagination.limit).limit(pagination.limit)
            else:
                # Если нет пагинации, получаем все записи и считаем их
                result = await self.session.execute(stmt)
                favorites = result.scalars().all()
                total = len(favorites)
                log.debug(f"📖 Получено {total} избранных вопросов для пользователя {user_id}")
                return list(favorites), total
            
            # Если есть пагинация, выполняем пагинированный запрос
            result = await self.session.execute(stmt)
            favorites = result.scalars().all()
            
            log.debug(f"📖 Получено {len(favorites)} избранных вопросов для пользователя {user_id} (всего: {total})")
            return list(favorites), total
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при получении избранных вопросов: {e}")
            raise
