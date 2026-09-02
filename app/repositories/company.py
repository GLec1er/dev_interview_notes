"""Репозиторий для работы с компаниями."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import func, select, delete, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.db.models.question import Company, Question
from app.core.loggers import log
from app.db.models.question_utils import QuestionCompletion
from app.repositories.base import BaseRepository
from app.schemas.base import PaginationParams
from app.schemas.company import CompanyCreate, CompanyUpdate


class CompanyRepository(BaseRepository[Company, CompanyCreate, CompanyUpdate]):
    """Репозиторий для работы с компаниями в БД."""

    def __init__(self, session: AsyncSession):
        super().__init__(Company, session)

    async def get_many(
        self,
        pagination: PaginationParams,
        level: Optional[str | None] = None,
        include_inactive: bool = False,
    ) -> tuple[List[Company], int]:
        """Получить список компаний.
        
        Args:
            pagination: Параметры пагинации
            include_inactive: Включать неактивные компании
            
        Returns:
            Кортеж (список компаний, общее количество)
        """
        try:
            # Подсчет общего количества
            count_query = select(func.count()).select_from(Company)
            if not include_inactive:
                count_query = count_query.where(Company.is_active == True)
            
            total_result = await self.session.execute(
                count_query.where(Company.level == level) if level else count_query
            )
            total = total_result.scalar_one()

            # Получение данных с пагинацией
            query = select(Company).where(Company.level == level) if level else select(Company)
            if not include_inactive:
                query = query.where(Company.is_active == True)
            
            query = query.order_by(Company.name)
            
            if pagination:
                query = query.offset((pagination.page_number - 1) * pagination.limit)
                query = query.limit(pagination.limit)
            
            result = await self.session.execute(query)
            companies = result.scalars().all()
            
            return companies, total
            
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении списка компаний: {e}")
            raise

    async def get_by_id(self, company_id: UUID) -> Optional[Company]:
        """Получение компании по ID.
        
        Args:
            company_id: UUID компании
            
        Returns:
            Объект Company или None
        """
        try:
            stmt = select(Company).where(Company.id == company_id)
            result = await self.session.execute(stmt)
            company = result.scalar_one_or_none()
            
            if company:
                log.debug(f"📖 Компания найдена: {company_id}")
            else:
                log.warning(f"⚠️ Компания не найдена: {company_id}")
            
            return company
        except Exception as e:
            log.error(f"❌ Ошибка при получении компании: {str(e)}")
            raise

    async def get_by_slug(self, slug: str) -> Optional[Company]:
        """Получение компании по слагу.
        
        Args:
            slug: Слаг компании
            
        Returns:
            Объект Company или None
        """
        try:
            stmt = select(Company).where(Company.slug == slug)
            result = await self.session.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            log.error(f"❌ Ошибка при получении компании по слагу: {str(e)}")
            raise

    async def get_all(self, include_inactive: bool = False) -> List[Company]:
        """Получить все компании.
        
        Args:
            include_inactive: Включать неактивные компании
            
        Returns:
            Список компаний
        """
        try:
            query = select(Company).order_by(Company.name)
            
            if not include_inactive:
                query = query.where(Company.is_active == True)
            
            result = await self.session.execute(query)
            return result.scalars().all()
        except Exception as e:
            log.error(f"❌ Ошибка при получении всех компаний: {str(e)}")
            raise

    async def get_questions_count(self, company_id: UUID) -> int:
        """Получить количество вопросов в компании.
        
        Args:
            company_id: UUID компании
            
        Returns:
            Количество вопросов
        """
        try:
            stmt = select(func.count()).select_from(Question).where(Question.company_id == company_id)
            result = await self.session.execute(stmt)
            return result.scalar_one()
        except Exception as e:
            log.error(f"❌ Ошибка при подсчете вопросов в компании: {str(e)}")
            raise
    
    async def get_completed_questions_count(self, company_id: UUID, user_id: UUID) -> int:
        """Получить количество закрытых вопросов для компании по пользователю."""
        try:
            # Подзапрос для закрытых вопросов пользователя
            subquery = select(QuestionCompletion.question_id).where(
                QuestionCompletion.user_id == user_id
            ).subquery()
            
            # Запрос для подсчета закрытых вопросов в компании
            query = select(func.count()).select_from(Question).where(
                Question.company_id == company_id,
                Question.id.in_(subquery)
            )
            
            result = await self.session.execute(query)
            return result.scalar() or 0
        except Exception as e:
            log.error(f"Ошибка при подсчете закрытых вопросов: {e}")
            return 0        
            
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
            from sqlalchemy.orm import joinedload
            
            # Подсчет общего количества
            count_query = select(func.count()).select_from(Question).where(
                Question.company_id == company_id
            )
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            # Получение данных с пагинацией
            query = select(Question).where(Question.company_id == company_id)
            query = query.options(joinedload(Question.answers))
            query = query.order_by(Question.created_at.desc())
            
            if pagination:
                query = query.offset((pagination.page_number - 1) * pagination.limit)
                query = query.limit(pagination.limit)
            
            result = await self.session.execute(query)
            questions = result.scalars().unique().all()
            
            return questions, total
        except Exception as e:
            log.error(f"❌ Ошибка при получении вопросов компании: {str(e)}")
            raise

    async def is_slug_unique(self, slug: str, exclude_id: Optional[UUID] = None) -> bool:
        """Проверить уникальность слага.
        
        Args:
            slug: Слаг компании
            exclude_id: ID компании, которую исключить из проверки (для обновления)
            
        Returns:
            True если слаг уникален
        """
        try:
            query = select(func.count()).select_from(Company).where(Company.slug == slug)
            
            if exclude_id:
                query = query.where(Company.id != exclude_id)
            
            result = await self.session.execute(query)
            count = result.scalar_one()
            return count == 0
        except Exception as e:
            log.error(f"❌ Ошибка при проверке уникальности слага: {str(e)}")
            raise

    async def delete_company(self, company_id: UUID) -> bool:
        """Удалить компанию.
        
        Args:
            company_id: UUID компании
            
        Returns:
            True если компания была удалена
        """
        try:
            stmt = delete(Company).where(Company.id == company_id)
            result = await self.session.execute(stmt)
            await self.session.commit()
            
            return result.rowcount > 0
        except Exception as e:
            await self.session.rollback()
            log.error(f"❌ Ошибка при удалении компании: {str(e)}")
            raise
    
    async def update_company(
        self, 
        company_id: UUID, 
        **kwargs,
    ) -> Optional[Company]:
        """Обновление компании.
        
        Args:
            company_id: UUID компании
            **kwargs: Поля для обновления
            
        Returns:
            Обновленный объект Company или None
        """
        try:
            company = await self.get_by_id(company_id)
            
            if not company:
                log.warning(f"⚠️ Компания не найдена для обновления: {company_id}")
                return None
            
            # Обновляем только переданные поля
            for key, value in kwargs.items():
                if value is not None and hasattr(company, key):
                    setattr(company, key, value)
            
            await self.session.flush()
            await self.session.refresh(company)  # Обновляем объект из БД
            log.info(f"✅ Компания обновлена: {company_id}")
            return company
        
        except Exception as e:
            log.error(f"❌ Ошибка при обновлении компании: {str(e)}")
            raise
    