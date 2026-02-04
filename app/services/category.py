"""Сервис для работы с категориями."""

from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.category import CategoryRepository
from app.schemas.base import PaginationParams
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
)
from app.core.loggers import log


class CategoryService:
    """Сервис для работы с категориями."""

    def __init__(self, repository: CategoryRepository):
        """Инициализация сервиса.
        
        Args:
            repository: Репозиторий категорий
        """
        self.repository = repository

    @classmethod
    def from_session(cls, session: AsyncSession) -> "CategoryService":
        """Создать сервис из сессии."""
        repository = CategoryRepository(session)
        return cls(repository)

    async def create_category(self, data: CategoryCreate) -> CategoryResponse:
        """Создание новой категории.
        
        Args:
            data: Данные для создания категории
            
        Returns:
            CategoryResponse с созданной категорией
            
        Raises:
            ValueError: Если категория с таким именем или слагом уже существует
        """
        try:
            # Проверяем уникальность имени и слага
            await self._validate_unique_category(data.name, data.slug)
            
            category = await self.repository.create(data)
            log.info(f"✅ Категория успешно создана: {category.id}")
            return CategoryResponse.model_validate(category)
        except ValueError as e:
            log.warning(f"⚠️ Валидация не пройдена: {e}")
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при создании категории: {str(e)}")
            raise

    async def get_many(
        self,
        pagination: PaginationParams,
        include_inactive: bool = False,
        current_user_id: Optional[UUID] = None,
    ) -> CategoryListResponse:
        """
        Получить список категорий с пагинацией.
        
        Args:
            pagination: Параметры пагинации
            include_inactive: Включать неактивные категории
            
        Returns:
            CategoryListResponse
        """
        try:
            categories, total = await self.repository.get_many(
                pagination=pagination,
                include_inactive=include_inactive,
                current_user_id=current_user_id,
            )
            
            # Получаем количество вопросов для каждой категории
            for category in categories:
                category.question_count = await self.repository.get_question_count(category.id, current_user_id)
            
            log.debug(f"📖 Получено {len(categories)} из {total} категорий")
            return CategoryListResponse(items=categories, total=total)
        except Exception as e:
            log.error(f"❌ Ошибка при получении списка категорий: {str(e)}")
            raise

    async def get_one(self, category_id: UUID) -> Optional[CategoryResponse]:
        """Получение категории по ID.
        
        Args:
            category_id: UUID категории
            
        Returns:
            CategoryResponse или None
        """
        try:
            category = await self.repository.get_by_id(category_id)
            
            if not category:
                log.warning(f"⚠️ Категория не найдена: {category_id}")
                return None
            
            # Получаем количество вопросов
            category.question_count = await self.repository.get_question_count(category_id)
            
            return CategoryResponse.model_validate(category)
        except Exception as e:
            log.error(f"❌ Ошибка при получении категории: {str(e)}")
            raise

    async def get_by_slug(self, slug: str) -> Optional[CategoryResponse]:
        """Получение категории по слагу.
        
        Args:
            slug: Слаг категории
            
        Returns:
            CategoryResponse или None
        """
        try:
            category = await self.repository.get_by_slug(slug)
            
            if not category:
                log.warning(f"⚠️ Категория не найдена по слагу: {slug}")
                return None
            
            # Получаем количество вопросов
            category.question_count = await self.repository.get_question_count(category.id)
            
            return CategoryResponse.model_validate(category)
        except Exception as e:
            log.error(f"❌ Ошибка при получении категории по слагу: {str(e)}")
            raise

    async def update_category(
        self,
        category_id: UUID,
        data: CategoryUpdate,
    ) -> Optional[CategoryResponse]:
        """Обновление категории.
        
        Args:
            category_id: UUID категории
            data: Данные для обновления
            
        Returns:
            CategoryResponse с обновленной категорией или None
        """
        try:
            # Проверяем существование категории
            existing_category = await self.repository.get_by_id(category_id)
            if not existing_category:
                log.warning(f"⚠️ Категория не найдена для обновления: {category_id}")
                return None
            
            # Проверяем уникальность, если обновляются имя или слаг
            if data.name or data.slug:
                new_name = data.name or existing_category.name
                new_slug = data.slug or existing_category.slug
                await self._validate_unique_category(new_name, new_slug, exclude_id=category_id)
            
            # Подготовка данных для обновления
            update_data = data.model_dump(exclude_unset=True)
            
            # Обновление в БД
            updated_category = await self.repository.update(
                category_id,
                **update_data,
            )
            
            if updated_category:
                log.info(f"✅ Категория успешно обновлена: {category_id}")
                return CategoryResponse.model_validate(updated_category)
            
            return None
        except ValueError:
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при обновлении категории: {str(e)}")
            raise

    async def delete_category(self, category_id: UUID) -> bool:
        """Удаление категории.
        
        Args:
            category_id: UUID категории
            
        Returns:
            True если категория удалена, False если не найдена
        """
        try:
            # Проверяем, есть ли вопросы в категории
            question_count = await self.repository.get_question_count(category_id)
            if question_count > 0:
                raise ValueError(
                    f"Невозможно удалить категорию с {question_count} вопросами. "
                    "Сначала удалите или переместите вопросы."
                )
            
            deleted = await self.repository.delete(category_id)
            
            if deleted:
                log.info(f"✅ Категория успешно удалена: {category_id}")
            else:
                log.warning(f"⚠️ Категория не найдена для удаления: {category_id}")
            
            return deleted
        except ValueError as e:
            log.warning(f"⚠️ Ошибка при удалении категории: {str(e)}")
            raise
        except Exception as e:
            log.error(f"❌ Ошибка при удалении категории: {str(e)}")
            raise

    async def _validate_unique_category(
        self,
        name: str,
        slug: str,
        exclude_id: Optional[UUID] = None,
    ) -> None:
        """Проверка уникальности имени и слага категории.
        
        Args:
            name: Название категории
            slug: Слаг категории
            exclude_id: ID категории для исключения из проверки
            
        Raises:
            ValueError: Если имя или слаг уже существуют
        """
        # Проверка по имени
        existing_by_name = await self.repository.get_by_name(name)
        if existing_by_name and (exclude_id is None or existing_by_name.id != exclude_id):
            raise ValueError(f"Категория с названием '{name}' уже существует")
        
        # Проверка по слагу
        existing_by_slug = await self.repository.get_by_slug(slug)
        if existing_by_slug and (exclude_id is None or existing_by_slug.id != exclude_id):
            raise ValueError(f"Категория со слагом '{slug}' уже существует")
