"""Репозиторий для работы с вопросами."""

from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import func, select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.db.models.question import Question
from app.core.loggers import log
from app.repositories.base import BaseRepository
from app.schemas.base import PaginationParams
from app.schemas.question import QuestionCreate,QuestionUpdate, QuestionFilterParams, QuestionSortParams


class QuestionRepository(
    BaseRepository[
        Question, # Модель вопроса
        QuestionCreate, # Схема создания вопроса
        QuestionUpdate, # Схема обновления вопроса
    ]
):
    """Репозиторий для работы с вопросами в БД."""

    def __init__(self, session: AsyncSession):
        super().__init__(Question, session)
    
    async def count_filtered(
        self,
        filters: Optional[Dict[str, Any]] = None,
    ) -> int:
        """Посчитать количество отфильтрованных записей."""
        try:
            query = select(func.count()).select_from(self.model)
            
            if filters:
                query = await self._apply_filters(query, filters)
            
            result = await self.session.execute(query)
            return result.scalar_one()
            
        except SQLAlchemyError as e:
            log.error(f"Ошибка при подсчете {self.model.__name__}: {e}")
            raise

    async def get_questions_list(
        self,
        filters: QuestionFilterParams,
        sort: QuestionSortParams,
        pagination: PaginationParams,
    ) -> tuple[List[Question], int]:
        """Получить отфильтрованный список вопросов."""
        try:
            query = select(self.model)
            
            # Применяем фильтры
            if filters:
                query = await self._apply_filters(
                    query, 
                    filters.get_filters(),
                )
            
            # Применяем сортировку
            query = await self._apply_sorting(
                query, 
                sort.sort_by, 
                sort.sort_dir.value,
            )
            
            # Применяем пагинацию
            if pagination:
                query = query.offset((pagination.page_number - 1) * pagination.limit).limit(pagination.limit)
            
            result = await self.session.execute(query)
            question_list = result.scalars().all()
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при фильтрации {self.model.__name__}: {e}")
            raise
        
        total = await self.count_filtered(filters=filters.get_filters())
        
        return question_list, total

    async def get_by_id(
        self, 
        question_id: UUID
    ) -> Optional[Question]:
        """Получение вопроса по ID.
        
        Args:
            question_id: UUID вопроса
            
        Returns:
            Объект Question или None
        """
        try:
            stmt = (
                select(Question)
                .where(Question.id == question_id)
                .options(
                    selectinload(Question.answers),
                )
            )
            result = await self.session.execute(stmt)
            question = result.scalar_one_or_none()
            
            if question:
                log.debug(f"📖 Вопрос найден: {question_id}")
            else:
                log.warning(f"⚠️ Вопрос не найден: {question_id}")
            
            return question
        except Exception as e:
            log.error(f"❌ Ошибка при получении вопроса: {str(e)}")
            raise

    async def get_by_slug(
        self, 
        slug: str,
    ) -> Optional[Question]:
        """Получение вопроса по слагу.
        
        Args:
            slug: Слаг вопроса
            
        Returns:
            Объект Question или None
        """
        try:
            stmt = (
                select(Question)
                .where(Question.slug == slug)
                .options(
                    selectinload(Question.answers),
                )
            )
            result = await self.session.execute(stmt)
            question = result.scalar_one_or_none()
            
            if question:
                log.debug(f"📖 Вопрос найден по слагу: {slug}")
            
            return question
        except Exception as e:
            log.error(f"❌ Ошибка при получении вопроса по слагу: {str(e)}")
            raise

    async def update(
        self, 
        question_id: UUID, 
        **kwargs
    ) -> Optional[Question]:
        """Обновление вопроса.
        
        Args:
            question_id: UUID вопроса
            **kwargs: Поля для обновления
            
        Returns:
            Обновленный объект Question или None
        """
        try:
            question = await self.get_by_id(question_id)
            
            if not question:
                log.warning(f"⚠️ Вопрос не найден для обновления: {question_id}")
                return None
            
            for key, value in kwargs.items():
                if value is not None and hasattr(question, key):
                    setattr(question, key, value)
            
            await self.session.flush()
            log.info(f"✅ Вопрос обновлен: {question_id}")
            return question
        except Exception as e:
            log.error(f"❌ Ошибка при обновлении вопроса: {str(e)}")
            raise

    async def delete(
        self, 
        question_id: UUID,
    ) -> bool:
        """Удаление вопроса.
        
        Args:
            question_id: UUID вопроса
            
        Returns:
            True если вопрос удален, False если не найден
        """
        try:
            stmt = delete(Question).where(Question.id == question_id)
            result = await self.session.execute(stmt)
            
            if result.rowcount > 0:
                log.info(f"✅ Вопрос удален: {question_id}")
                return True
            else:
                log.warning(f"⚠️ Вопрос не найден для удаления: {question_id}")
                return False
        except Exception as e:
            log.error(f"❌ Ошибка при удалении вопроса: {str(e)}")
            raise
