"""Репозиторий для работы с roadmaps."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, delete, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.db.models.question import Roadmap, RoadmapItem
from app.repositories.base import BaseRepository
from app.schemas.roadmap import RoadmapCreate, RoadmapUpdate
from app.core.loggers import log


class RoadmapRepository(BaseRepository[Roadmap, RoadmapCreate, RoadmapUpdate]):
    """Репозиторий для работы с roadmaps в БД."""

    def __init__(self, session: AsyncSession):
        super().__init__(Roadmap, session)

    async def get_by_id(self, id: UUID) -> Optional[Roadmap]:
        """Получить roadmap по slug с элементами."""
        try:
            query = (
                select(self.model)
                .where(self.model.id == id)
                .options(selectinload(self.model.roadmap_items).selectinload(RoadmapItem.category))
            )
            result = await self.session.execute(query)
            return result.scalars().first()
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении roadmap по ID {id}: {e}")
            raise

    async def get_by_slug(self, slug: str) -> Optional[Roadmap]:
        """Получить roadmap по slug с элементами."""
        try:
            query = (
                select(self.model)
                .where(self.model.slug == slug)
                .options(selectinload(self.model.roadmap_items).selectinload(RoadmapItem.category))
            )
            result = await self.session.execute(query)
            return result.scalars().first()
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении roadmap по slug {slug}: {e}")
            raise

    async def get_by_profession(self, profession: str, is_active: bool = True) -> List[Roadmap]:
        """Получить roadmaps по профессии."""
        try:
            query = select(self.model).where(
                self.model.profession == profession,
                self.model.is_active == is_active
            ).options(selectinload(self.model.roadmap_items))
            
            result = await self.session.execute(query)
            return result.scalars().all()
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении roadmaps по профессии {profession}: {e}")
            raise

    async def get_all_active(self) -> List[Roadmap]:
        """Получить все активные roadmaps."""
        try:
            query = select(self.model).where(
                self.model.is_active == True
            ).options(selectinload(self.model.roadmap_items))
            
            result = await self.session.execute(query)
            return result.scalars().all()
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении активных roadmaps: {e}")
            raise

    async def get_by_id_with_items(self, roadmap_id: UUID) -> Optional[Roadmap]:
        """Получить roadmap с элементами по ID."""
        try:
            query = (
                select(self.model)
                .where(self.model.id == roadmap_id)
                .options(
                    selectinload(self.model.roadmap_items).selectinload(RoadmapItem.category)
                )
            )
            result = await self.session.execute(query)
            return result.scalars().first()
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении roadmap с ID {roadmap_id}: {e}")
            raise

    async def delete_by_id(self, roadmap_id: UUID) -> bool:
        """Удалить roadmap по ID."""
        try:
            # Сначала удалим элементы roadmap
            await self.session.execute(
                delete(RoadmapItem).where(RoadmapItem.roadmap_id == roadmap_id)
            )
            
            # Затем удалим сам roadmap
            result = await self.session.execute(
                delete(self.model).where(self.model.id == roadmap_id)
            )
            await self.session.commit()
            return result.rowcount > 0
        except SQLAlchemyError as e:
            await self.session.rollback()
            log.error(f"Ошибка при удалении roadmap с ID {roadmap_id}: {e}")
            raise

    async def get_professions(self) -> List[str]:
        """Получить список всех профессий из активных roadmaps."""
        try:
            query = select(self.model.profession).where(
                self.model.is_active == True
            ).distinct()
            
            result = await self.session.execute(query)
            return result.scalars().all()
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении списка профессий: {e}")
            raise


class RoadmapItemRepository(BaseRepository[RoadmapItem, dict, dict]):
    """Репозиторий для работы с элементами roadmap."""

    def __init__(self, session: AsyncSession):
        super().__init__(RoadmapItem, session)

    async def get_by_item_id(self, item_id: UUID) -> Optional[RoadmapItem]:
        """Получить элемент roadmap по ID элемента."""
        try:
            query = select(self.model).where(
                self.model.id == item_id
            ).options(
                selectinload(self.model.category)
            )
            
            result = await self.session.execute(query)
            return result.scalars().first()
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении элемента roadmap {item_id}: {e}")
            raise

    async def get_by_roadmap_id(self, roadmap_id: UUID) -> List[RoadmapItem]:
        """Получить все элементы roadmap по ID дорожной карты."""
        try:
            query = select(self.model).where(
                self.model.roadmap_id == roadmap_id
            ).order_by(self.model.order).options(
                selectinload(self.model.category)
            )
            
            result = await self.session.execute(query)
            return result.scalars().all()
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении элементов roadmap {roadmap_id}: {e}")
            raise

    async def delete_by_item_id(self, item_id: UUID) -> bool:
        """Удалить элемент roadmap по ID элемента."""
        try:
            result = await self.session.execute(
                delete(self.model).where(self.model.id == item_id)
            )
            await self.session.commit()
            return result.rowcount > 0
        except SQLAlchemyError as e:
            await self.session.rollback()
            log.error(f"Ошибка при удалении элемента roadmap {item_id}: {e}")
            raise

    async def delete_by_roadmap_id(self, roadmap_id: UUID) -> int:
        """Удалить все элементы roadmap по ID дорожной карты."""
        try:
            result = await self.session.execute(
                delete(self.model).where(self.model.roadmap_id == roadmap_id)
            )
            await self.session.commit()
            return result.rowcount
        except SQLAlchemyError as e:
            await self.session.rollback()
            log.error(f"Ошибка при удалении элементов roadmap {roadmap_id}: {e}")
            raise

    async def get_max_order(self, roadmap_id: UUID) -> int:
        """Получить максимальный порядковый номер для roadmap."""
        try:
            query = select(func.max(self.model.order)).where(
                self.model.roadmap_id == roadmap_id
            )
            result = await self.session.execute(query)
            max_order = result.scalar()
            return max_order or 0
        except SQLAlchemyError as e:
            log.error(f"Ошибка при получении максимального порядка для roadmap {roadmap_id}: {e}")
            raise

    async def reorder_items(self, roadmap_id: UUID, item_orders: dict) -> None:
        """Переупорядочить элементы roadmap."""
        try:
            for item_id, new_order in item_orders.items():
                await self.session.execute(
                    select(self.model)
                    .where(self.model.id == item_id)
                    .update({"order": new_order})
                )
            await self.session.commit()
        except SQLAlchemyError as e:
            await self.session.rollback()
            log.error(f"Ошибка при переупорядочивании элементов roadmap {roadmap_id}: {e}")
            raise