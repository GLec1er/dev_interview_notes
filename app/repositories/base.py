from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import Select, asc, desc, select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel

from app.core.loggers import log
from app.db.models.question import Category
from app.db.models.question_utils import QuestionCompletion

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Базовый репозиторий с CRUD операциями."""
    
    def __init__(
        self, 
        model: Type[ModelType], 
        session: AsyncSession,
    ):
        """
        Инициализация репозитория.
        
        Args:
            model: SQLAlchemy модель
            session: Асинхронная сессия БД
        """
        self.model = model
        self.session = session
    
    async def get(self, id: UUID) -> Optional[ModelType]:
        """Получить объект по ID."""
        try:
            result = await self.session.get(self.model, id)
            return result
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении {self.model.__name__}: {e}")
            raise
    
    async def get_by(self, **filters) -> Optional[ModelType]:
        """Получить объект по фильтрам."""
        try:
            query = select(self.model).filter_by(**filters)
            result = await self.session.execute(query)
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении {self.model.__name__}: {e}")
            raise
    
    async def get_multi(
        self, 
        skip: int = 0, 
        limit: int = 100,
        **filters
    ) -> List[ModelType]:
        """Получить список объектов с пагинацией."""
        try:
            query = select(self.model).filter_by(**filters).offset(skip).limit(limit)
            result = await self.session.execute(query)
            return result.scalars().all()
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении списка {self.model.__name__}: {e}")
            raise
    
    async def create(self, obj_in: CreateSchemaType) -> ModelType:
        """Создать новый объект."""
        try:
            db_obj = self.model(**obj_in.model_dump())
            self.session.add(db_obj)
            await self.session.flush()
            log.info(f"✅ {self.model.__name__} создан: {db_obj.id}")
            return db_obj
        except SQLAlchemyError as e:
            log.error(f"Ошибка при создании {self.model.__name__}: {e}")
            await self.session.rollback()
            raise
    
    async def update(
        self, 
        db_obj: ModelType, 
        obj_in: UpdateSchemaType | Dict[str, Any]
    ) -> ModelType:
        """Обновить существующий объект."""
        try:
            update_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
            
            stmt = (
                update(self.model)
                .where(self.model.id == db_obj.id)
                .values(**update_data)
                .returning(self.model)
            )
            
            result = await self.session.execute(stmt)
            updated_obj = result.scalar_one()
            await self.session.flush()
            
            log.info(f"✅ {self.model.__name__} обновлен: {db_obj.id}")
            return updated_obj
        except SQLAlchemyError as e:
            log.error(f"Ошибка при обновлении {self.model.__name__}: {e}")
            await self.session.rollback()
            raise
    
    async def delete(self, id: UUID) -> bool:
        """Удалить объект по ID."""
        try:
            stmt = delete(self.model).where(self.model.id == id)
            result = await self.session.execute(stmt)
            await self.session.flush()
            
            deleted = result.rowcount > 0
            if deleted:
                log.info(f"✅ {self.model.__name__} удален: {id}")
            
            return deleted
        except SQLAlchemyError as e:
            log.error(f"Ошибка при удалении {self.model.__name__}: {e}")
            await self.session.rollback()
            raise
    
    async def exists(self, **filters) -> bool:
        """Проверить существование объекта."""
        try:
            query = select(self.model.id).filter_by(**filters).limit(1)
            result = await self.session.execute(query)
            return result.scalar_one_or_none() is not None
        except SQLAlchemyError as e:
            log.error(f"Ошибка при проверке существования {self.model.__name__}: {e}")
            raise

    async def _apply_filters(
        self, 
        query: Select, 
        filters: Dict[str, Any],
        current_user_id: UUID = None,
    ) -> Select:
        """Применить фильтры к запросу."""
        for key, value in filters.items():
            if value is not None:
                # Обработка специального фильтра для неактивных категорий
                if key == "exclude_inactive_categories" and value:
                    # Используем join для фильтрации по активным категориям
                    query = query.join(
                        Category,
                        self.model.category_id == Category.id
                    ).where(Category.is_active == True)
                    continue

                # Создаем подзапрос для поиска выполненных вопросов пользователем
                if key == "is_completed" and current_user_id:
                    subquery = select(QuestionCompletion.question_id).where(
                        QuestionCompletion.user_id == current_user_id
                    ).subquery()
                    
                    if value:  # Если нужны выполненные вопросы
                        query = query.where(self.model.id.in_(subquery))
                    else:  # Если нужны НЕ выполненные вопросы
                        query = query.where(self.model.id.notin_(subquery))
                    continue
                    
                column = getattr(self.model, key, None)
                if column is not None:
                    query = query.where(column == value)
                else:
                    log.warning(f"Поле '{key}' не найдено в модели {self.model.__name__}")
        return query
    
    async def _apply_sorting(self, query: Select, sort_by: str, sort_dir: str) -> Select:
        """Применить сортировку."""
        column = getattr(self.model, sort_by, None)
        if column is not None:
            if sort_dir.lower() == "desc":
                query = query.order_by(desc(column))
            else:
                query = query.order_by(asc(column))
        else:
            log.warning(f"Поле для сортировки '{sort_by}' не найдено")
            # Сортировка по умолчанию
            if hasattr(self.model, "created_at"):
                query = query.order_by(desc(self.model.created_at))
        
        return query
