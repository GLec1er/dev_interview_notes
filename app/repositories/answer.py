"""Репозиторий для работы с ответами."""

from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.question import Answer
from app.core.loggers import log
from app.repositories.base import BaseRepository
from app.schemas.answer import AnswerCreate, AnswerFilterParams, AnswerSortParams, AnswerUpdate
from app.schemas.base import PaginationParams


class AnswerRepository(
    BaseRepository[
        Answer,  # Модель ответа
        AnswerCreate,  # Схема создания ответа
        AnswerUpdate,  # Схема обновления ответа
    ]
):
    """Репозиторий для работы с ответами в БД."""

    def __init__(self, session: AsyncSession):
        super().__init__(Answer, session)

    async def create(
        self, 
        answer: Answer
    ) -> Answer:
        """Создание нового ответа.
        
        Args:
            answer: Объект Answer для сохранения
            
        Returns:
            Созданный объект Answer
        """
        try:
            self.session.add(answer)
            await self.session.flush()
            log.info(f"✅ Ответ создан: {answer.id}")
            return answer
        except Exception as e:
            log.error(f"❌ Ошибка при создании ответа: {str(e)}")
            raise

    async def get_by_id(
        self, 
        answer_id: UUID,
    ) -> Optional[Answer]:
        """Получение ответа по ID.
        
        Args:
            answer_id: UUID ответа
            
        Returns:
            Объект Answer или None
        """
        try:
            query = select(self.model).where(self.model.id == answer_id)
            result = await self.session.execute(query)
            answer = result.scalar_one_or_none()
            
            if answer:
                log.debug(f"📝 Ответ найден: {answer_id}")
            else:
                log.warning(f"⚠️ Ответ не найден: {answer_id}")
            
            return answer
        except Exception as e:
            log.error(f"❌ Ошибка при получении ответа: {str(e)}")
            raise

    async def get_by_question_id(
        self,
        question_id: UUID,
        filters: AnswerFilterParams,
        sort: AnswerSortParams,
        pagination: PaginationParams,
    ) -> List[Answer]:
        """Получение всех ответов на вопрос.
        
        Args:
            question_id: UUID вопроса
            filters: Параметры фильтрации
            sort: Параметры сортировки
            pagination: Параметры пагинации
            
        Returns:
            Список объектов Answer
        """
        try:
            query = select(self.model).where(self.model.question_id == question_id)
            
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
            answers = result.scalars().all()
            log.debug(f"📝 Получено {len(answers)} ответов для вопроса {question_id}")
            return answers

        except Exception as e:
            log.error(f"❌ Ошибка при получении ответов: {str(e)}")
            raise

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Answer]:
        """Получение всех ответов.
        
        Args:
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей
            
        Returns:
            Список объектов Answer
        """
        try:
            stmt = select(self.model).offset(skip).limit(limit)
            result = await self.session.execute(stmt)
            answers = result.scalars().all()
            
            log.debug(f"📝 Получено {len(answers)} ответов")
            return answers
        except Exception as e:
            log.error(f"❌ Ошибка при получении списка ответов: {str(e)}")
            raise

    async def update(
        self, 
        answer_id: UUID, 
        **kwargs,
    ) -> Optional[Answer]:
        """Обновление ответа.
        
        Args:
            answer_id: UUID ответа
            **kwargs: Поля для обновления
            
        Returns:
            Обновленный объект Answer или None
        """
        try:
            answer = await self.get_by_id(answer_id)
            
            if not answer:
                log.warning(f"⚠️ Ответ не найден для обновления: {answer_id}")
                return None
            
            for key, value in kwargs.items():
                if value is not None and hasattr(answer, key):
                    setattr(answer, key, value)
            
            await self.session.flush()
            log.info(f"✅ Ответ обновлен: {answer_id}")
            return answer
        except Exception as e:
            log.error(f"❌ Ошибка при обновлении ответа: {str(e)}")
            raise

    async def delete(
        self, 
        answer_id: UUID,
    ) -> bool:
        """Удаление ответа.
        
        Args:
            answer_id: UUID ответа
            
        Returns:
            True если ответ удален, False если не найден
        """
        try:
            stmt = delete(self.model).where(self.model.id == answer_id)
            result = await self.session.execute(stmt)
            
            if result.rowcount > 0:
                log.info(f"✅ Ответ удален: {answer_id}")
                return True
            else:
                log.warning(f"⚠️ Ответ не найден для удаления: {answer_id}")
                return False
        except Exception as e:
            log.error(f"❌ Ошибка при удалении ответа: {str(e)}")
            raise
