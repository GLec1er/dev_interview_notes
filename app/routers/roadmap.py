"""Маршруты для работы с roadmaps."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.authorizer import check_permission
from app.db.database import SessionDep
from app.db.models.auth import UserRole
from app.services.auth import CurrentActiveUser
from app.services.roadmap import RoadmapService
from app.schemas.roadmap import (
    RoadmapCreate,
    RoadmapUpdate,
    RoadmapResponse,
    RoadmapListResponse,
    RoadmapItemCreate,
    RoadmapItemResponse,
)
from app.core.loggers import log
from app.core.configs import settings


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/roadmaps",
    tags=["Roadmaps"],
)


# ==================== Public Roadmap Endpoints ====================

@router.get(
    "/",
    response_model=list[RoadmapListResponse],
    description="Получить список всех активных дорожных карт"
)
async def get_all_roadmaps(
    session: SessionDep,
):
    """Получить список всех активных дорожных карт."""
    try:
        service = RoadmapService.from_session(session)
        return await service.get_all_roadmaps(is_active=True)
    except Exception as e:
        log.error(f"Ошибка при получении roadmaps: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении дорожных карт"
        )


@router.get(
    "/professions",
    response_model=list[str],
    description="Получить список всех профессий"
)
async def get_professions(
    session: SessionDep,
):
    """Получить список всех профессий."""
    try:
        service = RoadmapService.from_session(session)
        return await service.get_professions()
    except Exception as e:
        log.error(f"Ошибка при получении профессий: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении профессий"
        )


@router.get(
    "/profession/{profession}",
    response_model=list[RoadmapResponse],
    description="Получить дорожные карты по профессии"
)
async def get_roadmaps_by_profession(
    profession: str,
    session: SessionDep,
):
    """Получить дорожные карты по профессии."""
    try:
        service = RoadmapService.from_session(session)
        return await service.get_roadmaps_by_profession(profession)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        log.error(f"Ошибка при получении roadmaps по профессии: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении дорожных карт"
        )


@router.get(
    "/{roadmap_slug}",
    response_model=RoadmapResponse,
    description="Получить дорожную карту по slug"
)
async def get_roadmap_by_slug(
    roadmap_slug: str,
    session: SessionDep,
):
    """Получить дорожную карту с элементами по slug."""
    try:
        service = RoadmapService.from_session(session)
        return await service.get_roadmap_by_slug(roadmap_slug)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        log.error(f"Ошибка при получении roadmap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении дорожной карты"
        )


@router.get(
    "/{roadmap_slug}/detail",
    description="Получить детали дорожной карты с вопросами по slug"
)
async def get_roadmap_detail_by_slug(
    roadmap_slug: str,
    session: SessionDep,
):
    """Получить дорожную карту с деталями вопросов по slug."""
    try:
        service = RoadmapService.from_session(session)
        return await service.get_roadmap_detail_by_slug(roadmap_slug)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        log.error(f"Ошибка при получении деталей roadmap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении дорожной карты"
        )


# ==================== Admin Roadmap Endpoints ====================

@router.post(
    "/",
    response_model=RoadmapResponse,
    description="Создать новую дорожную карту (только для админа)"
)
@check_permission(required_role=UserRole.ADMIN)
async def create_roadmap(
    current_user: CurrentActiveUser,
    data: RoadmapCreate,
    session: SessionDep,
):
    """Создать новую дорожную карту."""
    try:
        service = RoadmapService.from_session(session)
        return await service.create_roadmap(data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        log.error(f"Ошибка при создании roadmap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при создании дорожной карты"
        )


@router.put(
    "/{roadmap_id}",
    response_model=RoadmapResponse,
    description="Обновить дорожную карту (только для админа)"
)
@check_permission(required_role=UserRole.ADMIN)
async def update_roadmap(
    roadmap_id: UUID,
    current_user: CurrentActiveUser,
    data: RoadmapUpdate,
    session: SessionDep,
):
    """Обновить дорожную карту."""
    try:
        service = RoadmapService.from_session(session)
        return await service.update_roadmap(roadmap_id, data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        log.error(f"Ошибка при обновлении roadmap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при обновлении дорожной карты"
        )


@router.delete(
    "/{roadmap_id}",
    description="Удалить дорожную карту (только для админа)"
)
@check_permission(required_role=UserRole.ADMIN)
async def delete_roadmap(
    roadmap_id: UUID,
    current_user: CurrentActiveUser,
    session: SessionDep,
):
    """Удалить дорожную карту."""
    try:
        service = RoadmapService.from_session(session)
        if await service.delete_roadmap(roadmap_id):
            return {"message": "Дорожная карта успешно удалена"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Дорожная карта не найдена"
            )
    except Exception as e:
        log.error(f"Ошибка при удалении roadmap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении дорожной карты"
        )


# ==================== Roadmap Items Endpoints ====================

@router.post(
    "/{roadmap_id}/items",
    response_model=RoadmapItemResponse,
    description="Добавить элемент в дорожную карту (только для админа)"
)
@check_permission(required_role=UserRole.ADMIN)
async def add_roadmap_item(
    roadmap_id: UUID,
    current_user: CurrentActiveUser,
    item_data: RoadmapItemCreate,
    session: SessionDep,
):
    """Добавить элемент в дорожную карту."""
    try:
        service = RoadmapService.from_session(session)
        return await service.add_roadmap_item(roadmap_id, item_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        log.error(f"Ошибка при добавлении элемента roadmap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при добавлении элемента"
        )


@router.put(
    "/items/{item_id}",
    response_model=RoadmapItemResponse,
    description="Обновить элемент дорожной карты (только для админа)"
)
@check_permission(required_role=UserRole.ADMIN)
async def update_roadmap_item(
    item_id: UUID,
    current_user: CurrentActiveUser,
    data: dict,
    session: SessionDep,
):
    """Обновить элемент дорожной карты."""
    try:
        service = RoadmapService.from_session(session)
        return await service.update_roadmap_item(item_id, data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        log.error(f"Ошибка при обновлении элемента roadmap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при обновлении элемента"
        )


@router.delete(
    "/items/{item_id}",
    description="Удалить элемент дорожной карты (только для админа)"
)
@check_permission(required_role=UserRole.ADMIN)
async def delete_roadmap_item(
    item_id: UUID,
    current_user: CurrentActiveUser,
    session: SessionDep,
):
    """Удалить элемент дорожной карты."""
    try:
        service = RoadmapService.from_session(session)
        if await service.delete_roadmap_item(item_id):
            return {"message": "Элемент успешно удален"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Элемент не найден"
            )
    except Exception as e:
        log.error(f"Ошибка при удалении элемента roadmap: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении элемента"
        )
