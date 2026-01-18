"""Маршруты для работы с избранными вопросами."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.authorizer import Permission, ResourceType, check_permission
from app.db.database import SessionDep
from app.db.models.auth import UserRole
from app.schemas.question_favorite import (
    FavoriteResponse,
    IsFavoritedResponse,
    UserFavoritesListResponse,
    FavoritesCountResponse,
    FavoriteQuestionInfo,
)
from app.schemas.base import PaginationParams
from app.services.auth import CurrentActiveUser
from app.services.question_favorite import QuestionFavoriteService
from app.core.loggers import log
from app.core.configs import settings


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/questions",
    tags=["Question Favorites"],
)

# ==================== Favorite Management ====================

@router.post(
    "/{question_id}/favorite",
    response_model=FavoriteResponse,
    status_code=status.HTTP_200_OK,
    description="Добавить вопрос в избранное",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def add_to_favorites(
    current_user: CurrentActiveUser,
    question_id: UUID,
    session: SessionDep,
):
    """Добавить вопрос в избранное.
    
    Args:
        question_id: UUID вопроса
        session: Сессия БД
        
    Returns:
        FavoriteResponse
        
    Raises:
        HTTPException: Если вопрос не найден или уже в избранном
    """
    try:
        service = QuestionFavoriteService.from_session(session)
        
        # Добавляем вопрос в избранное
        favorite = await service.add_to_favorites(
            user_id=current_user.id,
            question_id=question_id,
        )
        
        if not favorite:
            log.warning(f"⚠️ Не удалось добавить вопрос {question_id} в избранное")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось добавить вопрос в избранное",
            )
        
        # Сохраняем изменения
        await session.commit()
        
        return FavoriteResponse(
            success=True,
            message="Вопрос успешно добавлен в избранное",
            question_id=question_id,
            user_id=current_user.id,
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при добавлении вопроса в избранное: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при добавлении вопроса в избранное",
        )


@router.delete(
    "/{question_id}/favorite",
    response_model=FavoriteResponse,
    status_code=status.HTTP_200_OK,
    description="Удалить вопрос из избранного",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def remove_from_favorites(
    current_user: CurrentActiveUser,
    question_id: UUID,
    session: SessionDep,
):
    """Удалить вопрос из избранного.
    
    Args:
        question_id: UUID вопроса
        session: Сессия БД
        
    Returns:
        FavoriteResponse
        
    Raises:
        HTTPException: Если вопрос не был в избранном
    """
    try:
        service = QuestionFavoriteService.from_session(session)
        
        # Удаляем вопрос из избранного
        deleted = await service.remove_from_favorites(
            user_id=current_user.id,
            question_id=question_id,
        )
        
        if not deleted:
            log.warning(f"⚠️ Вопрос {question_id} не был в избранном пользователя {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Вопрос не найден в избранном",
            )
        
        # Сохраняем изменения
        await session.commit()
        
        return FavoriteResponse(
            success=True,
            message="Вопрос успешно удален из избранного",
            question_id=question_id,
            user_id=current_user.id,
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при удалении вопроса из избранного: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении вопроса из избранного",
        )


@router.get(
    "/{question_id}/is-favorited",
    response_model=IsFavoritedResponse,
    status_code=status.HTTP_200_OK,
    description="Проверить, находится ли вопрос в избранном",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def is_question_favorited(
    current_user: CurrentActiveUser,
    question_id: UUID,
    session: SessionDep,
):
    """Проверить, находится ли вопрос в избранном пользователя.
    
    Args:
        question_id: UUID вопроса
        session: Сессия БД
        
    Returns:
        IsFavoritedResponse с информацией о статусе
    """
    try:
        service = QuestionFavoriteService.from_session(session)
        
        is_favorited = await service.is_question_favorited(
            user_id=current_user.id,
            question_id=question_id,
        )
        
        return IsFavoritedResponse(
            question_id=question_id,
            is_favorited=is_favorited,
        )
    except Exception as e:
        log.error(f"❌ Ошибка при проверке статуса избранного: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при проверке статуса избранного",
        )


# ==================== Favorites List ====================

@router.get(
    "/favorites/list",
    response_model=UserFavoritesListResponse,
    status_code=status.HTTP_200_OK,
    description="Получить список избранных вопросов пользователя",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def get_user_favorites(
    current_user: CurrentActiveUser,
    session: SessionDep,
    pagination: PaginationParams = Depends(),
):
    """Получить список избранных вопросов пользователя.
    
    Args:
        current_user: Текущий пользователь
        session: Сессия БД
        
    Returns:
        UserFavoritesListResponse со списком избранных вопросов
    """
    try:
        service = QuestionFavoriteService.from_session(session)
        favorites, total = await service.get_user_favorite_questions(
            user_id=current_user.id,
            pagination=pagination,
        )
        
        items = [
            FavoriteQuestionInfo(
                favorite_id=favorite.id,
                question_id=favorite.question_id,
                question_title=favorite.question.title,
                question_difficulty=favorite.question.difficulty,
                user_id=favorite.user_id,
                added_at=favorite.added_at,
            )
            for favorite in favorites
        ]
        
        return UserFavoritesListResponse(
            items=items,
            total=total,
        )
    except Exception as e:
        log.error(f"❌ Ошибка при получении списка избранных вопросов: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении списка избранных вопросов",
        )
