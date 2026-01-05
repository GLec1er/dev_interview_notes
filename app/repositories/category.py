"""Репозиторий для работы с категориями."""

from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy import func, select, delete, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.db.models.question import Category, QuestionCategory
from app.core.loggers import log
from app.repositories.base import BaseRepository
from app.schemas.base import PaginationParams
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryRepository(BaseRepository[Category, CategoryCreate, CategoryUpdate]):
    """Репозиторий для работы с категориями в БД."""

    def __init__(self, session: AsyncSession):
        super().__init__(Category, session)

    async def get_many(
        self,
        pagination: PaginationParams,
        include_inactive: bool = False,
    ) -> tuple[List[Category], int]:
        """Получить список категорий.
        
        Args:
            pagination: Параметры пагинации
            include_inactive: Включать неактивные категории
            
        Returns:
            Кортеж (список категорий, общее количество)
        """
        try:
            # Подсчет общего количества
            count_query = select(func.count()).select_from(Category)
            if not include_inactive:
                count_query = count_query.where(Category.is_active == True)
            
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            # Получение данных с пагинацией
            query = select(Category)
            if not include_inactive:
                query = query.where(Category.is_active == True)
            
            query = query.order_by(Category.name)
            
            if pagination:
                query = query.offset((pagination.page_number - 1) * pagination.limit)
                query = query.limit(pagination.limit)
            
            result = await self.session.execute(query)
            categories = result.scalars().all()
            
            return categories, total
            
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении списка категорий: {e}")
            raise

    async def get_by_id(self, category_id: UUID) -> Optional[Category]:
        """Получение категории по ID.
        
        Args:
            category_id: UUID категории
            
        Returns:
            Объект Category или None
        """
        try:
            stmt = select(Category).where(Category.id == category_id)
            result = await self.session.execute(stmt)
            category = result.scalar_one_or_none()
            
            if category:
                log.debug(f"📖 Категория найдена: {category_id}")
            else:
                log.warning(f"⚠️ Категория не найдена: {category_id}")
            
            return category
        except Exception as e:
            log.error(f"❌ Ошибка при получении категории: {str(e)}")
            raise

    async def get_by_slug(self, slug: str) -> Optional[Category]:
        """Получение категории по слагу.
        
        Args:
            slug: Слаг категории
            
        Returns:
            Объект Category или None
        """
        try:
            stmt = select(Category).where(Category.slug == slug)
            result = await self.session.execute(stmt)
            category = result.scalar_one_or_none()
            
            if category:
                log.debug(f"📖 Категория найдена по слагу: {slug}")
            
            return category
        except Exception as e:
            log.error(f"❌ Ошибка при получении категории по слагу: {str(e)}")
            raise

    async def get_by_name(self, name: str) -> Optional[Category]:
        """Получение категории по имени.
        
        Args:
            name: Название категории
            
        Returns:
            Объект Category или None
        """
        try:
            stmt = select(Category).where(func.lower(Category.name) == name.lower())
            result = await self.session.execute(stmt)
            category = result.scalar_one_or_none()
            
            return category
        except Exception as e:
            log.error(f"❌ Ошибка при получении категории по имени: {str(e)}")
            raise

    async def get_question_count(self, category_id: UUID) -> int:
        """Получить количество вопросов в категории.
        
        Args:
            category_id: UUID категории
            
        Returns:
            Количество вопросов
        """
        try:
            stmt = select(func.count()).select_from(QuestionCategory).where(
                QuestionCategory.category_id == category_id
            )
            result = await self.session.execute(stmt)
            return result.scalar_one()
        except Exception as e:
            log.error(f"❌ Ошибка при подсчете вопросов в категории: {str(e)}")
            raise

    async def update(
        self,
        category_id: UUID,
        **kwargs,
    ) -> Optional[Category]:
        """Обновление категории.
        
        Args:
            category_id: UUID категории
            **kwargs: Поля для обновления
            
        Returns:
            Обновленный объект Category или None
        """
        try:
            category = await self.get_by_id(category_id)
            
            if not category:
                log.warning(f"⚠️ Категория не найдена для обновления: {category_id}")
                return None
            
            for key, value in kwargs.items():
                if value is not None and hasattr(category, key):
                    setattr(category, key, value)
            
            await self.session.flush()
            log.info(f"✅ Категория обновлена: {category_id}")
            return category
        except Exception as e:
            log.error(f"❌ Ошибка при обновлении категории: {str(e)}")
            raise

    async def delete(self, category_id: UUID) -> bool:
        """Удаление категории.
        
        Args:
            category_id: UUID категории
            
        Returns:
            True если категория удалена, False если не найдена
        """
        try:
            # Удаляем связи с вопросами
            delete_links_stmt = delete(QuestionCategory).where(
                QuestionCategory.category_id == category_id
            )
            await self.session.execute(delete_links_stmt)
            
            # Удаляем саму категорию
            stmt = delete(Category).where(Category.id == category_id)
            result = await self.session.execute(stmt)
            
            if result.rowcount > 0:
                log.info(f"✅ Категория удалена: {category_id}")
                return True
            else:
                log.warning(f"⚠️ Категория не найдена для удаления: {category_id}")
                return False
        except Exception as e:
            log.error(f"❌ Ошибка при удалении категории: {str(e)}")
            raise

    async def get_categories_for_question(self, question_id: UUID) -> List[Category]:
        """Получить категории для вопроса.
        
        Args:
            question_id: UUID вопроса
            
        Returns:
            Список категорий
        """
        try:
            stmt = (
                select(Category)
                .join(QuestionCategory, Category.id == QuestionCategory.category_id)
                .where(QuestionCategory.question_id == question_id)
            )
            result = await self.session.execute(stmt)
            return result.scalars().all()
        except Exception as e:
            log.error(f"❌ Ошибка при получении категорий для вопроса: {str(e)}")
            raise

    async def add_category_to_question(
        self,
        question_id: UUID,
        category_id: UUID,
    ) -> bool:
        """Добавить категорию к вопросу.
        
        Args:
            question_id: UUID вопроса
            category_id: UUID категории
            
        Returns:
            True если связь добавлена, False если уже существует
        """
        try:
            # Проверяем, существует ли уже связь
            check_stmt = select(QuestionCategory).where(
                and_(
                    QuestionCategory.question_id == question_id,
                    QuestionCategory.category_id == category_id,
                )
            )
            result = await self.session.execute(check_stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                log.debug(f"⚠️ Связь уже существует: question={question_id}, category={category_id}")
                return False
            
            # Создаем новую связь
            link = QuestionCategory(
                question_id=question_id,
                category_id=category_id,
            )
            self.session.add(link)
            await self.session.flush()
            
            log.info(f"✅ Категория {category_id} добавлена к вопросу {question_id}")
            return True
        except Exception as e:
            log.error(f"❌ Ошибка при добавлении категории к вопросу: {str(e)}")
            raise

    async def remove_category_from_question(
        self,
        question_id: UUID,
        category_id: UUID,
    ) -> bool:
        """Удалить категорию из вопроса.
        
        Args:
            question_id: UUID вопроса
            category_id: UUID категории
            
        Returns:
            True если связь удалена, False если не найдена
        """
        try:
            stmt = delete(QuestionCategory).where(
                and_(
                    QuestionCategory.question_id == question_id,
                    QuestionCategory.category_id == category_id,
                )
            )
            result = await self.session.execute(stmt)
            
            if result.rowcount > 0:
                log.info(f"✅ Категория {category_id} удалена из вопроса {question_id}")
                return True
            else:
                log.warning(f"⚠️ Связь не найдена: question={question_id}, category={category_id}")
                return False
        except Exception as e:
            log.error(f"❌ Ошибка при удалении категории из вопроса: {str(e)}")
            raise

    async def set_question_categories(
        self,
        question_id: UUID,
        category_ids: List[UUID],
    ) -> List[Category]:
        """Установить категории для вопроса (заменить существующие).
        
        Args:
            question_id: UUID вопроса
            category_ids: Список ID категорий
            
        Returns:
            Список установленных категорий
        """
        try:
            # Удаляем все существующие связи
            delete_stmt = delete(QuestionCategory).where(
                QuestionCategory.question_id == question_id
            )
            await self.session.execute(delete_stmt)
            
            # Добавляем новые связи
            for category_id in category_ids:
                link = QuestionCategory(
                    question_id=question_id,
                    category_id=category_id,
                )
                self.session.add(link)
            
            await self.session.flush()
            
            # Получаем обновленный список категорий
            categories = await self.get_categories_for_question(question_id)
            log.info(f"✅ Установлены {len(categories)} категорий для вопроса {question_id}")
            
            return categories
        except Exception as e:
            log.error(f"❌ Ошибка при установке категорий для вопроса: {str(e)}")
            raise
