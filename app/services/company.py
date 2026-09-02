"""Сервис для работы с компаниями."""

from typing import Optional, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.company import CompanyRepository
from app.schemas.base import PaginationParams
from app.schemas.company import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    CompanyListResponse,
    CompanyWithQuestionsResponse,
)
from app.db.models.question import Question
from app.core.loggers import log


class CompanyService:
    """Сервис для работы с компаниями."""

    def __init__(self, repository: CompanyRepository):
        """Инициализация сервиса.
        
        Args:
            repository: Репозиторий компаний
        """
        self.repository = repository

    @classmethod
    def from_session(cls, session: AsyncSession) -> "CompanyService":
        """Создать сервис из сессии."""
        repository = CompanyRepository(session)
        return cls(repository)

    async def create_company(self, data: CompanyCreate) -> CompanyResponse:
        """Создание новой компании.
        
        Args:
            data: Данные для создания компании
            
        Returns:
            CompanyResponse с созданной компанией
            
        Raises:
            ValueError: Если компания с таким слагом уже существует
        """
        try:
            # Проверяем уникальность слага
            is_unique = await self.repository.is_slug_unique(data.slug)
            if not is_unique:
                raise ValueError(f"Компания с слагом '{data.slug}' уже существует")
            
            company = await self.repository.create(data)
            log.info(f"✅ Компания успешно создана: {company.id}")
            return CompanyResponse.model_validate(company)
        except ValueError as e:
            log.warning(f"⚠️ Валидация не пройдена: {e}")
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при создании компании: {str(e)}")
            raise

    async def get_many(
        self,
        pagination: PaginationParams,
        include_inactive: bool = False,
    ) -> CompanyListResponse:
        """Получить список компаний с пагинацией.
        
        Args:
            pagination: Параметры пагинации
            include_inactive: Включать неактивные компании
            
        Returns:
            CompanyListResponse
        """
        try:
            companies, total = await self.repository.get_many(
                pagination=pagination,
                include_inactive=include_inactive,
            )
            
            log.debug(f"📖 Получено {len(companies)} из {total} компаний")
            return CompanyListResponse(
                items=[CompanyResponse.model_validate(c) for c in companies],
                total=total,
                page=pagination.page_number,
                page_size=pagination.limit,
            )
        except Exception as e:
            log.error(f"❌ Ошибка при получении списка компаний: {str(e)}")
            raise

    async def get_one(self, company_id: UUID) -> Optional[CompanyResponse]:
        """Получение компании по ID.
        
        Args:
            company_id: UUID компании
            
        Returns:
            CompanyResponse или None
        """
        try:
            company = await self.repository.get_by_id(company_id)
            if company:
                return CompanyResponse.model_validate(company)
            return None
        except Exception as e:
            log.error(f"❌ Ошибка при получении компании: {str(e)}")
            raise

    async def get_all(self, include_inactive: bool = False) -> List[CompanyResponse]:
        """Получить все компании.
        
        Args:
            include_inactive: Включать неактивные компании
            
        Returns:
            Список CompanyResponse
        """
        try:
            companies = await self.repository.get_all(include_inactive=include_inactive)
            return [CompanyResponse.model_validate(c) for c in companies]
        except Exception as e:
            log.error(f"❌ Ошибка при получении всех компаний: {str(e)}")
            raise

    async def get_with_questions(
        self,
        level: Optional[str],
        current_user: Optional[UUID],
        pagination: PaginationParams,
        include_inactive: bool = False,
    ) -> CompanyListResponse:
        """Получить список компаний с информацией о количестве вопросов.
        
        Args:
            pagination: Параметры пагинации
            include_inactive: Включать неактивные компании
            
        Returns:
            CompanyListResponse
        """
        try:
            companies, total = await self.repository.get_many(
                level=level,
                pagination=pagination,
                include_inactive=include_inactive,
            )
            
            items = []
            for company in companies:
                questions_count = await self.repository.get_questions_count(company.id)
                completed_questions_count = await self.repository.get_completed_questions_count(company.id, user_id=current_user.id)
                response = CompanyWithQuestionsResponse(
                    **CompanyResponse.model_validate(company).model_dump(),
                    questions_count=questions_count,
                    completed_questions_count=completed_questions_count,
                )
                items.append(response)
            
            log.debug(f"📖 Получено {len(items)} из {total} компаний с информацией о вопросах")
            return CompanyListResponse(
                items=items,
                total=total,
                page=pagination.page_number,
                page_size=pagination.limit,
            )
        except Exception as e:
            log.error(f"❌ Ошибка при получении компаний с вопросами: {str(e)}")
            raise

    async def update_company(self, company_id: UUID, data: CompanyUpdate) -> CompanyResponse:
        """Обновление компании.
        
        Args:
            company_id: UUID компании
            data: Данные для обновления
            
        Returns:
            CompanyResponse с обновленной компанией
            
        Raises:
            ValueError: Если компания не найдена или слаг не уникален
        """
        try:
            # Проверяем существование компании
            company = await self.repository.get_by_id(company_id)
            if not company:
                raise ValueError(f"Компания с ID {company_id} не найдена")
            
            # Проверяем уникальность нового слага (если был изменен)
            if data.slug and data.slug != company.slug:
                is_unique = await self.repository.is_slug_unique(data.slug, exclude_id=company_id)
                if not is_unique:
                    raise ValueError(f"Компания с слагом '{data.slug}' уже существует")
            
            # Преобразуем Pydantic модель в словарь, исключая неустановленные значения
            update_data = data.model_dump(exclude_unset=True)
            
            # Обновляем компанию
            updated_company = await self.repository.update_company(company_id, **update_data)
            
            if not updated_company:
                raise ValueError(f"Не удалось обновить компанию с ID {company_id}")
            
            log.info(f"✅ Компания успешно обновлена: {company_id}")
            return CompanyResponse.model_validate(updated_company)
        
        except ValueError as e:
            log.warning(f"⚠️ Ошибка валидации: {e}")
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при обновлении компании: {str(e)}")
            raise

    async def delete_company(self, company_id: UUID) -> bool:
        """Удаление компании.
        
        Args:
            company_id: UUID компании
            
        Returns:
            True если компания была удалена
            
        Raises:
            ValueError: Если компания не найдена
        """
        try:
            company = await self.repository.get_by_id(company_id)
            if not company:
                raise ValueError(f"Компания с ID {company_id} не найдена")
            
            result = await self.repository.delete_company(company_id)
            if result:
                log.info(f"✅ Компания успешно удалена: {company_id}")
            return result
        except ValueError as e:
            log.warning(f"⚠️ Ошибка валидации: {e}")
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при удалении компании: {str(e)}")
            raise

    async def get_company_questions(
        self,
        company_id: UUID,
        pagination: Optional[PaginationParams] = None,
    ) -> tuple[List[Question], int]:
        """Получить вопросы компании.
        
        Args:
            company_id: UUID компании
            pagination: Параметры пагинации
            
        Returns:
            Кортеж (список вопросов, общее количество)
        """
        try:
            # Проверяем существование компании
            company = await self.repository.get_by_id(company_id)
            if not company:
                raise ValueError(f"Компания с ID {company_id} не найдена")
            
            questions, total = await self.repository.get_company_questions(
                company_id=company_id,
                pagination=pagination,
            )
            
            log.debug(f"📖 Получено {len(questions)} из {total} вопросов для компании {company_id}")
            return questions, total
        except ValueError as e:
            log.warning(f"⚠️ Ошибка валидации: {e}")
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при получении вопросов компании: {str(e)}")
            raise
