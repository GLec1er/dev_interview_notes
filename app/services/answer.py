"""Сервис для работы с ответами."""

from typing import Optional, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.question import Answer
from app.repositories.answer import AnswerRepository
from app.repositories.question import QuestionRepository
from app.schemas.answer import AnswerCreate, AnswerFilterParams, AnswerSortParams, AnswerUpdate, AnswerResponse, AnswerUpdateResponse
from app.core.loggers import log
from app.schemas.base import PaginationParams


class AnswerService:
    """Сервис для работы с ответами."""

    def __init__(
        self, 
        repository: AnswerRepository,
        question_repository: QuestionRepository,
    ):
        """Инициализация сервиса.
        
        Args:
            session: AsyncSession для работы с БД
        """
        self.repository = repository
        self.question_repository = question_repository

    @classmethod
    def from_session(cls, session: AsyncSession) -> "AnswerService":
        """Создать сервис из сессии."""
        repository = AnswerRepository(session)
        question_repository = QuestionRepository(session)
        return cls(
            repository=repository,
            question_repository=question_repository,
        )

    async def create_answer(
        self,
        question_id: UUID,
        data: AnswerCreate,
        current_user,
    ) -> AnswerResponse:
        """Создание нового ответа на вопрос.
        
        Args:
            question_id: UUID вопроса
            data: Данные для создания ответа
            
        Returns:
            AnswerResponse с созданным ответом
            
        Raises:
            ValueError: Если вопрос не существует
        """
        try:
            # Проверка существования вопроса
            question = await self.question_repository.get_by_id(question_id, current_user.id)
            if not question:
                log.warning(f"⚠️ Вопрос не найден: {question_id}")
                raise ValueError(f"Вопрос с ID {question_id} не существует")
            
            user_id = None
            if not current_user.is_admin:
                user_id = current_user.id

            # Создание объекта Answer
            answer = Answer(
                question_id=question_id,
                content=data.content,
                is_published=data.is_published,
                user_id=user_id,
            )
            
            created_answer = await self.repository.create(answer)
            log.info(f"✅ Ответ успешно создан: {created_answer.id}")
            
            return AnswerResponse.model_validate(created_answer)
        except ValueError:
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при создании ответа: {str(e)}")
            raise

    async def get_answer(
        self, 
        answer_id: UUID,
    ) -> Optional[AnswerResponse]:
        """Получение ответа по ID.
        
        Args:
            answer_id: UUID ответа
            
        Returns:
            AnswerResponse или None
        """
        try:
            answer = await self.repository.get_by_id(answer_id)
            
            if not answer:
                log.warning(f"⚠️ Ответ не найден: {answer_id}")
                return None
            
            return AnswerResponse.model_validate(answer)
        except Exception as e:
            log.error(f"❌ Ошибка при получении ответа: {str(e)}")
            raise

    async def get_answers_by_question(
        self,
        question_id: UUID,
        current_user_id: UUID,
        filters: AnswerFilterParams,
        sort: AnswerSortParams,
        pagination: PaginationParams,
    ) -> List[AnswerResponse]:
        """Получение всех ответов на вопрос.
        
        Args:
            question_id: UUID вопроса
            filters: Параметры фильтрации
            sort: Параметры сортировки
            pagination: Параметры пагинации
            
        Returns:
            Список AnswerResponse
            
        Raises:
            ValueError: Если вопрос не существует
        """
        try:
            # Проверка существования вопроса
            question = await self.question_repository.get_by_id(question_id, current_user_id)
            if not question:
                log.warning(f"⚠️ Вопрос не найден: {question_id}")
                raise ValueError(f"Вопрос с ID {question_id} не существует")
            
            answers = await self.repository.get_by_question_id(
                question_id=question_id,
                filters=filters,
                sort=sort,
                pagination=pagination,
            )
            
            return [AnswerResponse.model_validate(a) for a in answers]
        except ValueError:
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при получении ответов: {str(e)}")
            raise

    async def get_all_answers(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> List[AnswerResponse]:
        """Получение всех ответов.
        
        Args:
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей
            
        Returns:
            Список AnswerResponse
        """
        try:
            answers = await self.repository.get_all(skip=skip, limit=limit)
            
            return [AnswerResponse.model_validate(a) for a in answers]
        except Exception as e:
            log.error(f"❌ Ошибка при получении списка ответов: {str(e)}")
            raise

    async def update_answer(
        self,
        answer_id: UUID,
        data: AnswerUpdate,
    ) -> Optional[AnswerUpdateResponse]:
        """Обновление ответа.
        
        Args:
            answer_id: UUID ответа
            data: Данные для обновления
            
        Returns:
            AnswerUpdateResponse с обновленным ответом или None
        """
        try:
            # Проверка существования ответа
            existing_answer = await self.repository.get_by_id(answer_id)
            if not existing_answer:
                log.warning(f"⚠️ Ответ не найден для обновления: {answer_id}")
                return None
            
            # Подготовка данных для обновления
            update_data = data.model_dump(exclude_unset=True)
            
            updated_answer = await self.repository.update(answer_id, **update_data)
            
            if updated_answer:
                log.info(f"✅ Ответ успешно обновлен: {answer_id}")
                return AnswerUpdateResponse.model_validate(updated_answer)
            
            return None
        except Exception as e:
            log.error(f"❌ Ошибка при обновлении ответа: {str(e)}")
            raise

    async def delete_answer(
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
            deleted = await self.repository.delete(answer_id)
            
            if deleted:
                log.info(f"✅ Ответ успешно удален: {answer_id}")
            else:
                log.warning(f"⚠️ Ответ не найден для удаления: {answer_id}")
            
            return deleted
        except Exception as e:
            log.error(f"❌ Ошибка при удалении ответа: {str(e)}")
            raise
