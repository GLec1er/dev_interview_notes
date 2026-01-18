from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.core.authorizer import Permission, ResourceType, check_permission
from app.db.database import SessionDep
from app.db.models.auth import UserRole
from app.repositories.user import UserRepository
from app.schemas.base import PaginationParams
from app.schemas.user import UserAdminBase, UserUpdate, UserBase, UserUpdateAdminBase
from app.services.auth import CurrentActiveUser
from app.core.loggers import log
from app.core.configs import settings


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/users",
    tags=["Users"],
)


class UserListResponse:
    """Response model for user list"""
    items: List[UserAdminBase]
    total: int


@router.get(
    "/",
    response_model=dict,
    description="Получение списка всех пользователей (только для админа)",
)
@check_permission(required_role=UserRole.ADMIN)
async def get_users(
    current_user: CurrentActiveUser,
    session: SessionDep,

):
    """Получить список всех пользователей.
    
    Args:
        page_number: Номер страницы
        limit: Количество элементов на странице
        sort_by: Поле для сортировки
        sort_dir: Направление сортировки (asc/desc)
        
    Returns:
        Список пользователей с общим количеством
        
    Raises:
        HTTPException: Если пользователь не админ
    """
    try:
        user_repo = UserRepository(session)

        total = len(await user_repo.get_multi())
        users = await user_repo.get_multi()

        users_data = [
            UserAdminBase.model_validate(user.__dict__) for user in users
        ]
                
        return {
            "items": users_data,
            "total": total,
        }
        
    except Exception as e:
        log.error(f"❌ Ошибка при получении списка пользователей: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении списка пользователей",
        )


@router.get(
    "/{user_id}",
    response_model=UserAdminBase,
    description="Получение пользователя по ID (только для админа)",
)
@check_permission(required_role=UserRole.ADMIN)
async def get_user(
    current_user: CurrentActiveUser,
    user_id: UUID,
    session: SessionDep,
):
    """Получить пользователя по ID.
    
    Args:
        user_id: UUID пользователя
        session: Сессия БД
        
    Returns:
        UserAdminBase
        
    Raises:
        HTTPException: Если пользователь не найден
    """
    try:
        user_repo = UserRepository(session)
        user = await user_repo.get(user_id)
        
        if not user:
            log.warning(f"⚠️ Пользователь не найден: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Пользователь с ID {user_id} не найден",
            )
        
        return UserAdminBase.model_validate(user.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при получении пользователя: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении пользователя",
        )


@router.put(
    "/{user_id}",
    response_model=UserAdminBase,
    description="Обновление пользователя по ID (только для админа)",
)
@check_permission(required_role=UserRole.ADMIN)
async def update_user(
    current_user: CurrentActiveUser,
    user_id: UUID,
    data: UserUpdateAdminBase,
    session: SessionDep,
):
    """Обновить пользователя.
    
    Args:
        user_id: UUID пользователя
        data: Данные для обновления
        session: Сессия БД
        
    Returns:
        UserAdminBase с обновленным пользователем
        
    Raises:
        HTTPException: Если пользователь не найден или ошибка валидации
    """
    try:
        user_repo = UserRepository(session)
        user = await user_repo.get(user_id)
        
        if not user:
            log.warning(f"⚠️ Пользователь не найден для обновления: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Пользователь с ID {user_id} не найден",
            )
        
        # Обновляем пользователя
        updated_user = await user_repo.update(user, data)
        await session.commit()
        
        log.info(f"✅ Пользователь обновлен: {user_id}")
        return UserAdminBase.model_validate(updated_user.__dict__)
        
    except HTTPException:
        raise
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при обновлении пользователя: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при обновлении пользователя: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при обновлении пользователя",
        )


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление пользователя по ID (только для админа)",
)
@check_permission(required_role=UserRole.ADMIN)
async def delete_user(
    current_user: CurrentActiveUser,
    user_id: UUID,
    session: SessionDep,
) -> None:
    """Удалить пользователя.
    
    Args:
        user_id: UUID пользователя
        session: Сессия БД
        
    Raises:
        HTTPException: Если пользователь не найден
    """
    try:
        user_repo = UserRepository(session)
        deleted = await user_repo.delete(user_id)
        
        if not deleted:
            log.warning(f"⚠️ Пользователь не найден для удаления: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Пользователь с ID {user_id} не найден",
            )
        
        await session.commit()
        log.info(f"✅ Пользователь удален: {user_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при удалении пользователя: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении пользователя",
        )
