"""Сервис для работы с вопросами."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.question import Question
from app.repositories.question import QuestionRepository
from app.schemas.base import PaginationParams
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.core.loggers import log
from app.schemas.question import QuestionFilterParams, QuestionSortParams, QuestionResponse


class QuestionService:
    """Сервис для работы с вопросами."""

    def __init__(
        self, 
        repository: QuestionRepository,
    ):
        """Инициализация сервиса.
        
        Args:
            repository: Репозиторий вопросов
        """
        self.repository = repository

    @classmethod
    def from_session(cls, session: AsyncSession) -> "QuestionService":
        """Создать сервис из сессии."""
        repository = QuestionRepository(session)
        return cls(repository)

    async def create_question(
        self, 
        data: QuestionCreate
    ) -> QuestionResponse:
        """Создание нового вопроса.
        
        Args:
            data: Данные для создания вопроса
            
        Returns:
            QuestionResponse с созданным вопросом
            
        Raises:
            ValueError: Если вопрос с таким слагом уже существует
        """
        try:            
            question = await self.repository.create(data)
            log.info(f"✅ Вопрос успешно создан: {question.id}")
            return QuestionResponse.model_validate(question)
        except ValueError as e:
            log.warning(f"⚠️ Валидация не пройдена: {e}")
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при создании вопроса: {str(e)}")
            raise

    async def get_many(
        self,
        filters: QuestionFilterParams,
        sort: QuestionSortParams,
        pagination: PaginationParams,
    ) -> tuple[List[Question], int]:
        """
        Получить список вопросов с фильтрацией, сортировкой и пагинацией.
        Args:
            filters: Параметры фильтрации
            sort: Параметры сортировки
            pagination: Параметры пагинации
        Returns:
            Словарь с ключами "items" (список вопросов) и "total" (общее количество)
        """
        try:
            question_list, total = await self.repository.get_questions_list(
                filters=filters,
                sort=sort,
                pagination=pagination,
            )
            
            # Преобразуем модели в схемы ответа
            question_list = [
                QuestionResponse.model_validate(q) for q in question_list
            ]

            log.debug(f"📖 Получено {len(question_list)} из {total} вопросов")
            return question_list, total
            
        except Exception as e:
            log.error(f"❌ Ошибка при получении списка вопросов: {str(e)}")
            raise     
    
    async def get_one(
        self, 
        question_id: UUID,
    ) -> Optional[QuestionResponse]:
        """Получение вопроса по ID.
        
        Args:
            question_id: UUID вопроса
            
        Returns:
            QuestionResponse или None
        """
        try:
            question = await self.repository.get_by_id(question_id)
            
            if not question:
                log.warning(f"⚠️ Вопрос не найден: {question_id}")
                return None
            
            return QuestionResponse.model_validate(question)
        except Exception as e:
            log.error(f"❌ Ошибка при получении вопроса: {str(e)}")
            raise


    async def update_question(
        self,
        question_id: UUID,
        data: QuestionUpdate,
    ) -> Optional[QuestionResponse]:
        """Обновление вопроса.
        
        Args:
            question_id: UUID вопроса
            data: Данные для обновления
            
        Returns:
            QuestionResponse с обновленным вопросом или None
            
        Raises:
            ValueError: Если новый слаг уже существует
        """
        try:
            # Проверка существования вопроса
            existing_question = await self.repository.get_by_id(question_id)
            if not existing_question:
                log.warning(f"⚠️ Вопрос не найден для обновления: {question_id}")
                return None
            
            # Подготовка данных для обновления
            update_data = data.model_dump(exclude_unset=True)
            
            # Обновление в БД
            updated_question = await self.repository.update(
                question_id, 
                **update_data,
            )
            
            if updated_question:
                log.info(f"✅ Вопрос успешно обновлен: {question_id}")
                return QuestionResponse.model_validate(updated_question)
            
            return None
        except ValueError:
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при обновлении вопроса: {str(e)}")
            raise

    async def delete_question(
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
            deleted = await self.repository.delete(question_id)
            
            if deleted:
                log.info(f"✅ Вопрос успешно удален: {question_id}")
            else:
                log.warning(f"⚠️ Вопрос не найден для удаления: {question_id}")
            
            return deleted
        except Exception as e:
            log.error(f"❌ Ошибка при удалении вопроса: {str(e)}")
            raise
