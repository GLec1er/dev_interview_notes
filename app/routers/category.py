from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.authorizer import Permission, ResourceType, check_permission
from app.db.database import SessionDep
from app.db.models.auth import UserRole
from app.schemas.category import CategoryCreate, CategoryListResponse, CategoryResponse, CategoryUpdate
from app.services.auth import CurrentActiveUser
from app.services.category import CategoryService
from app.schemas.base import PaginationParams
from app.core.loggers import log
from app.core.configs import settings


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/questions",
    tags=["Categories"],
)


@router.post(
    "/categories/",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    description="Создание новой категории",
)
@check_permission(required_role=UserRole.ADMIN)
async def create_category(
    current_user: CurrentActiveUser,
    data: CategoryCreate,
    session: SessionDep,
):
    """Создать новую категорию.
    
    Args:
        data: Данные для создания категории
        
    Returns:
        CategoryResponse с созданной категорией
        
    Raises:
        HTTPException: Если категория с таким именем или слагом уже существует
    """
    try:
        service = CategoryService.from_session(session)
        return await service.create_category(data)
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при создании категории: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при создании категории: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при создании категории",
        )


@router.get(
    "/categories/",
    response_model=CategoryListResponse,
    description="Получение списка категорий с пагинацией",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.CATEGORY,
)
async def get_categories(
    current_user: CurrentActiveUser,
    session: SessionDep,
    pagination: PaginationParams = Depends(),
    include_inactive: bool = False,
):
    """Получить список категорий.
    
    Args:
        pagination: Параметры пагинации
        include_inactive: Включать неактивные категории
        
    Returns:
        CategoryListResponse
    """
    try:
        service = CategoryService.from_session(session)
        return await service.get_many(pagination, include_inactive)
    except Exception as e:
        log.error(f"❌ Ошибка при получении списка категорий: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении списка категорий",
        )


@router.get(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    description="Получение категории по ID",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.CATEGORY,
)
async def get_category(
    current_user: CurrentActiveUser,
    category_id: UUID,
    session: SessionDep,
):
    """Получить категорию по ID.
    
    Args:
        category_id: UUID категории
        
    Returns:
        CategoryResponse
        
    Raises:
        HTTPException: Если категория не найдена
    """
    try:
        service = CategoryService.from_session(session)
        category = await service.get_one(category_id)
        
        if not category:
            log.warning(f"⚠️ Категория не найдена: {category_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Категория с ID {category_id} не найдена",
            )
        
        return category
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при получении категории: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении категории",
        )


@router.put(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    description="Обновление категории по ID",
)
@check_permission(required_role=UserRole.ADMIN)
async def update_category(
    current_user: CurrentActiveUser,
    category_id: UUID,
    data: CategoryUpdate,
    session: SessionDep,
):
    """Обновить категорию.
    
    Args:
        category_id: UUID категории
        data: Данные для обновления
        
    Returns:
        CategoryResponse с обновленной категорией
        
    Raises:
        HTTPException: Если категория не найдена
    """
    try:
        service = CategoryService.from_session(session)
        category = await service.update_category(category_id, data)
        
        if not category:
            log.warning(f"⚠️ Категория не найдена для обновления: {category_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Категория с ID {category_id} не найдена",
            )
        
        return category
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при обновлении категории: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при обновлении категории: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при обновлении категории",
        )


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление категории по ID",
)
@check_permission(required_role=UserRole.ADMIN)
async def delete_category(
    current_user: CurrentActiveUser,
    category_id: UUID,
    session: SessionDep,
) -> None:
    """Удалить категорию.
    
    Args:
        category_id: UUID категории
        session: Сессия БД
        
    Raises:
        HTTPException: Если категория не найдена или содержит вопросы
    """
    try:
        service = CategoryService.from_session(session)
        deleted = await service.delete_category(category_id)
        
        if not deleted:
            log.warning(f"⚠️ Категория не найдена для удаления: {category_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Категория с ID {category_id} не найдена",
            )
    except ValueError as e:
        log.warning(f"⚠️ Ошибка при удалении категории: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при удалении категории: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении категории",
        )
