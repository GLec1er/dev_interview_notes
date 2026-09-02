"""Сервис для работы с roadmaps."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.question import Roadmap, RoadmapItem, Category, Question
from app.repositories.roadmap import RoadmapRepository, RoadmapItemRepository
from app.repositories.category import CategoryRepository
from app.repositories.question import QuestionRepository
from app.schemas.roadmap import (
    RoadmapCreate,
    RoadmapUpdate,
    RoadmapResponse,
    RoadmapListResponse,
    RoadmapItemCreate,
    RoadmapItemResponse,
)
from app.core.loggers import log
from sqlalchemy import select


class RoadmapService:
    """Сервис для работы с roadmaps."""

    def __init__(
        self,
        roadmap_repository: RoadmapRepository,
        roadmap_item_repository: RoadmapItemRepository,
        category_repository: CategoryRepository,
        question_repository: QuestionRepository,
        session: AsyncSession,
    ):
        """Инициализация сервиса."""
        self.roadmap_repo = roadmap_repository
        self.roadmap_item_repo = roadmap_item_repository
        self.category_repo = category_repository
        self.question_repo = question_repository
        self.session = session

    @classmethod
    def from_session(cls, session: AsyncSession) -> "RoadmapService":
        """Создать сервис из сессии."""
        return cls(
            roadmap_repository=RoadmapRepository(session),
            roadmap_item_repository=RoadmapItemRepository(session),
            category_repository=CategoryRepository(session),
            question_repository=QuestionRepository(session),
            session=session,
        )

    def _generate_slug(self, title: str) -> str:
        """Сгенерировать slug из названия."""
        import re
        slug = title.lower().strip()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')

    async def create_roadmap(self, data: RoadmapCreate) -> RoadmapResponse:
        """Создать новую дорожную карту.
        
        Args:
            data: Данные для создания roadmap
            
        Returns:
            RoadmapResponse с созданной дорожной картой
        """
        try:
            # Генерируем slug
            slug = self._generate_slug(data.title)
            
            # Создаем roadmap
            roadmap = Roadmap(
                title=data.title,
                slug=slug,
                profession=data.profession,
                description=data.description,
            )
            
            self.session.add(roadmap)
            await self.session.flush()
            
            # Добавляем элементы roadmap
            if data.roadmap_items:
                for idx, item_data in enumerate(data.roadmap_items):
                    # Проверяем, что категория существует
                    category = await self.category_repo.get_by_id(item_data.category_id)
                    if not category:
                        raise ValueError(f"Категория с ID {item_data.category_id} не найдена")
                    
                    roadmap_item = RoadmapItem(
                        roadmap_id=roadmap.id,
                        category_id=item_data.category_id,
                        question_ids=item_data.question_ids or [],
                        order=item_data.order if item_data.order else idx,
                    )
                    self.session.add(roadmap_item)
            
            await self.session.commit()
            
            # Перезагружаем roadmap с элементами
            return await self.get_roadmap_by_id(roadmap.id)
            
        except Exception as e:
            await self.session.rollback()
            log.error(f"Ошибка при создании roadmap: {e}")
            raise

    async def get_roadmap_by_id(self, roadmap_id: UUID) -> RoadmapResponse:
        """Получить roadmap по ID.
        
        Args:
            roadmap_id: ID дорожной карты
            
        Returns:
            RoadmapResponse
        """
        roadmap = await self.roadmap_repo.get_by_id_with_items(roadmap_id)
        if not roadmap:
            raise ValueError(f"Roadmap с ID {roadmap_id} не найден")
        
        return self._roadmap_to_response(roadmap)

    async def get_roadmap_by_slug(self, slug: str) -> RoadmapResponse:
        """Получить roadmap по slug.
        
        Args:
            slug: Slug дорожной карты
            
        Returns:
            RoadmapResponse
        """
        roadmap = await self.roadmap_repo.get_by_slug(slug)
        if not roadmap:
            raise ValueError(f"Roadmap с slug {slug} не найден")
        
        return self._roadmap_to_response(roadmap)

    async def get_roadmap_detail_by_slug(self, slug: str) -> dict:
        """Получить детали roadmap с вопросами по slug.
        
        Args:
            slug: Slug дорожной карты
            
        Returns:
            Словарь с roadmap и items (вопросы из категорий)
        """
        roadmap = await self.roadmap_repo.get_by_slug(slug)
        if not roadmap:
            raise ValueError(f"Roadmap с slug {slug} не найден")
        
        # Собираем вопросы из каждого элемента (категории)
        items = []
        for roadmap_item in roadmap.roadmap_items:
            # Если указаны конкретные question_ids, берем только их
            if roadmap_item.question_ids:
                questions = await self.question_repo.get_by_ids(roadmap_item.question_ids)
            else:
                # Иначе берем все вопросы из категории
                result = await self.question_repo.get_by_category_id(roadmap_item.category_id)
                questions = result if result else []
            
            # Добавляем вопросы с информацией о порядке
            for idx, question in enumerate(questions):
                items.append({
                    'id': str(question.id),
                    'title': question.title,
                    'slug': question.slug,
                    'difficulty': question.difficulty,
                    'order': roadmap_item.order * 1000 + idx,  # Гарантируем уникальный порядок
                    'category_id': str(roadmap_item.category_id),
                    'category_name': (await self.category_repo.get_by_id(roadmap_item.category_id)).name if roadmap_item.category_id else None,
                })
        
        # Сортируем по порядку
        items.sort(key=lambda x: x['order'])
        
        return {
            'id': str(roadmap.id),
            'title': roadmap.title,
            'slug': roadmap.slug,
            'profession': roadmap.profession,
            'description': roadmap.description,
            'is_active': roadmap.is_active,
            'items_count': len(items),
            'created_at': roadmap.created_at,
            'updated_at': roadmap.updated_at,
            'items': items,
        }

    async def get_roadmaps_by_profession(self, profession: str) -> List[RoadmapResponse]:
        """Получить roadmaps по профессии.
        
        Args:
            profession: Профессия/специальность
            
        Returns:
            Список RoadmapResponse
        """
        roadmaps = await self.roadmap_repo.get_by_profession(profession)
        return [self._roadmap_to_response(rm) for rm in roadmaps]

    async def get_all_roadmaps(self, is_active: bool = True) -> List[RoadmapListResponse]:
        """Получить все roadmaps.
        
        Args:
            is_active: Только активные
            
        Returns:
            Список RoadmapListResponse
        """
        if is_active:
            roadmaps = await self.roadmap_repo.get_all_active()
        else:
            roadmaps = await self.roadmap_repo.get_all()
        
        result = []
        for roadmap in roadmaps:
            result.append(
                RoadmapListResponse(
                    id=roadmap.id,
                    title=roadmap.title,
                    slug=roadmap.slug,
                    profession=roadmap.profession,
                    description=roadmap.description,
                    is_active=roadmap.is_active,
                    items_count=len(roadmap.roadmap_items),
                    created_at=roadmap.created_at,
                    updated_at=roadmap.updated_at,
                )
            )
        
        return result

    async def update_roadmap(self, roadmap_id: UUID, data: RoadmapUpdate) -> RoadmapResponse:
        """Обновить roadmap.
        
        Args:
            roadmap_id: ID дорожной карты
            data: Данные для обновления
            
        Returns:
            Обновленная RoadmapResponse
        """
        try:
            roadmap = await self.roadmap_repo.get_by_id(roadmap_id)
            if not roadmap:
                raise ValueError(f"Roadmap с ID {roadmap_id} не найден")
            
            # Обновляем поля
            if data.title:
                roadmap.title = data.title
                roadmap.slug = self._generate_slug(data.title)
            if data.profession:
                roadmap.profession = data.profession
            if data.description is not None:
                roadmap.description = data.description
            if data.is_active is not None:
                roadmap.is_active = data.is_active
            
            await self.session.commit()
            
            return await self.get_roadmap_by_id(roadmap_id)
            
        except Exception as e:
            await self.session.rollback()
            log.error(f"Ошибка при обновлении roadmap: {e}")
            raise

    async def delete_roadmap(self, roadmap_id: UUID) -> bool:
        """Удалить roadmap.
        
        Args:
            roadmap_id: ID дорожной карты
            
        Returns:
            True если удален успешно
        """
        return await self.roadmap_repo.delete_by_id(roadmap_id)

    async def add_roadmap_item(
        self, 
        roadmap_id: UUID, 
        item_data: RoadmapItemCreate
    ) -> RoadmapItemResponse:
        """Добавить элемент в roadmap.
        
        Args:
            roadmap_id: ID дорожной карты
            item_data: Данные элемента
            
        Returns:
            RoadmapItemResponse
        """
        try:
            # Проверяем, что roadmap существует
            roadmap = await self.roadmap_repo.get_by_id(roadmap_id)
            if not roadmap:
                raise ValueError(f"Roadmap с ID {roadmap_id} не найден")
            
            # Проверяем категорию только если она указана
            if item_data.category_id:
                category = await self.category_repo.get_by_id(item_data.category_id)
                if not category:
                    raise ValueError(f"Категория с ID {item_data.category_id} не найдена")
            
            # Получаем максимальный order
            items = await self.roadmap_item_repo.get_by_roadmap_id(roadmap_id)
            max_order = max([item.order for item in items], default=0)
            
            roadmap_item = RoadmapItem(
                roadmap_id=roadmap_id,
                category_id=item_data.category_id,
                question_ids=item_data.question_ids or [],
                order=item_data.order if item_data.order > 0 else max_order + 1,
            )
            
            self.session.add(roadmap_item)
            await self.session.commit()
            
            return RoadmapItemResponse.from_orm(roadmap_item)
            
        except Exception as e:
            await self.session.rollback()
            log.error(f"Ошибка при добавлении элемента roadmap: {e}")
            raise

    async def update_roadmap_item(
        self, 
        item_id: UUID, 
        data: dict
    ) -> RoadmapItemResponse:
        """Обновить элемент roadmap.
        
        Args:
            item_id: ID элемента
            data: Данные для обновления
            
        Returns:
            RoadmapItemResponse
        """
        try:
            # Используем правильный метод для получения одного элемента
            item = await self.roadmap_item_repo.get_by_item_id(item_id)
            if not item:
                raise ValueError(f"Элемент с ID {item_id} не найден")
            
            # Обновляем поля
            if 'category_id' in data and data['category_id']:
                category = await self.category_repo.get_by_id(data['category_id'])
                if not category:
                    raise ValueError(f"Категория с ID {data['category_id']} не найдена")
                item.category_id = data['category_id']
            elif 'category_id' in data and data['category_id'] is None:
                # Если передан None, сбрасываем категорию
                item.category_id = None
            
            if 'question_ids' in data:
                item.question_ids = data['question_ids'] or []
            
            if 'order' in data and data['order'] is not None:
                item.order = data['order']
            
            await self.session.commit()
            await self.session.refresh(item)
            
            return RoadmapItemResponse.from_orm(item)
            
        except Exception as e:
            await self.session.rollback()
            log.error(f"Ошибка при обновлении элемента roadmap: {e}")
            raise

    async def delete_roadmap_item(self, item_id: UUID) -> bool:
        """Удалить элемент roadmap.
        
        Args:
            item_id: ID элемента
            
        Returns:
            True если удален успешно
        """
        return await self.roadmap_item_repo.delete_by_item_id(item_id)

    async def get_professions(self) -> List[str]:
        """Получить список всех профессий.
        
        Returns:
            Список профессий
        """
        return await self.roadmap_repo.get_professions()

    def _roadmap_to_response(self, roadmap: Roadmap) -> RoadmapResponse:
        """Конвертировать Roadmap в RoadmapResponse."""
        items = [
            RoadmapItemResponse(
                id=item.id,
                roadmap_id=item.roadmap_id,
                category_id=item.category_id,
                question_ids=item.question_ids,
                order=item.order,
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
            for item in roadmap.roadmap_items
        ]
        
        return RoadmapResponse(
            id=roadmap.id,
            title=roadmap.title,
            slug=roadmap.slug,
            profession=roadmap.profession,
            description=roadmap.description,
            is_active=roadmap.is_active,
            roadmap_items=items,
            created_at=roadmap.created_at,
            updated_at=roadmap.updated_at,
        )
