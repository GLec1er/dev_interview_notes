"""Маршруты для работы с отметками выполнения вопросов."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.core.authorizer import Permission, ResourceType, check_permission
from app.db.database import SessionDep
from app.db.models.auth import UserRole
from app.schemas.question_completion import CategoryCompletionStats, CategoryCompletionStatsListResponse, CompletionResponse, CompletionStatsResponse
from app.services.auth import CurrentActiveUser
from app.services.question_completion import QuestionCompletionService
from app.core.loggers import log
from app.core.configs.init import settings


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/questions",
    tags=["Question Completion"],
)

@router.post(
    "/{question_id}/complete",
    response_model=CompletionResponse,
    status_code=status.HTTP_200_OK,
    description="Отметить вопрос как выполненный",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def mark_question_complete(
    current_user: CurrentActiveUser,
    question_id: UUID,
    session: SessionDep,
):
    """Отметить вопрос как выполненный.
    
    Args:
        question_id: UUID вопроса
        session: Сессия БД
        
    Returns:
        CompletionResponse
        
    Raises:
        HTTPException: Если вопрос не найден
    """
    try:
        service = QuestionCompletionService.from_session(session)
        
        # Отмечаем вопрос как выполненный
        completion = await service.mark_question_complete(
            user_id=current_user.id,
            question_id=question_id,
        )
        
        if not completion:
            log.warning(f"⚠️ Не удалось отметить вопрос {question_id} как выполненный")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось отметить вопрос как выполненный",
            )
        
        # Сохраняем изменения
        await session.commit()
        
        return CompletionResponse(
            success=True,
            message="Вопрос успешно отмечен как выполненный",
            question_id=question_id,
            user_id=current_user.id,
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при отметке вопроса как выполненного: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при отметке вопроса как выполненного",
        )


@router.delete(
    "/{question_id}/complete",
    response_model=CompletionResponse,
    status_code=status.HTTP_200_OK,
    description="Снять отметку выполнения с вопроса",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def unmark_question_complete(
    current_user: CurrentActiveUser,
    question_id: UUID,
    session: SessionDep,
):
    """Снять отметку выполнения с вопроса.
    
    Args:
        question_id: UUID вопроса
        session: Сессия БД
        
    Returns:
        CompletionResponse
        
    Raises:
        HTTPException: Если отметка не найдена
    """
    try:
        service = QuestionCompletionService.from_session(session)
        
        # Снимаем отметку выполнения
        deleted = await service.unmark_question_complete(
            user_id=current_user.id,
            question_id=question_id,
        )
        
        if not deleted:
            log.warning(f"⚠️ Отметка выполнения не найдена для вопроса {question_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Отметка выполнения не найдена",
            )
        
        # Сохраняем изменения
        await session.commit()
        
        return CompletionResponse(
            success=True,
            message="Отметка выполнения успешно удалена",
            question_id=question_id,
            user_id=current_user.id,
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при удалении отметки выполнения: {str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении отметки выполнения",
        )


@router.get(
    "/{question_id}/is-completed",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    description="Проверить, выполнен ли вопрос пользователем",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def is_question_completed(
    current_user: CurrentActiveUser,
    question_id: UUID,
    session: SessionDep,
):
    """Проверить, выполнен ли вопрос пользователем.
    
    Args:
        question_id: UUID вопроса
        session: Сессия БД
        
    Returns:
        Словарь с информацией о выполнении
    """
    try:
        service = QuestionCompletionService.from_session(session)
        
        is_completed = await service.is_question_completed(
            user_id=current_user.id,
            question_id=question_id,
        )
        
        return {
            "question_id": str(question_id),
            "is_completed": is_completed,
        }
    except Exception as e:
        log.error(f"❌ Ошибка при проверке выполнения вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при проверке выполнения вопроса",
        )


# ==================== Statistics Endpoints ====================

@router.get(
    "/completion/stats",
    response_model=CompletionStatsResponse,
    status_code=status.HTTP_200_OK,
    description="Получить статистику выполнения вопросов",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def get_completion_stats(
    current_user: CurrentActiveUser,
    session: SessionDep,
):
    """Получить статистику выполнения вопросов пользователем.
    
    Args:
        session: Сессия БД
        
    Returns:
        CompletionStatsResponse
    """
    try:
        service = QuestionCompletionService.from_session(session)
        
        # Получаем статистику
        stats = await service.get_user_completion_stats(current_user.id)
        
        # Получаем общий процент
        overall_percentage = await service.get_overall_completion_percentage(current_user.id)
        
        return CompletionStatsResponse(
            total=stats['total'],
            total_completed=stats['total_completed'],
            total_easy=stats['total_easy'],
            easy_completed=stats['easy_completed'],
            total_medium=stats['total_medium'],
            medium_completed=stats['medium_completed'],
            total_hard=stats['total_hard'],
            hard_completed=stats['hard_completed'],
            overall_percentage=overall_percentage,
        )
    except Exception as e:
        log.error(f"❌ Ошибка при получении статистики выполнения: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении статистики выполнения",
        )


@router.get(
    "/completion/stats-by-category",
    response_model=CategoryCompletionStatsListResponse,
    status_code=status.HTTP_200_OK,
    description="Получить статистику выполнения вопросов по категориям",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def get_completion_stats_by_category(
    current_user: CurrentActiveUser,
    session: SessionDep,
):
    """Получить статистику выполнения вопросов по категориям.
    
    Args:
        session: Сессия БД
        
    Returns:
        CategoryCompletionStatsListResponse
    """
    try:
        service = QuestionCompletionService.from_session(session)
        
        # Получаем статистику по категориям
        stats = await service.get_user_completion_stats_by_category(current_user.id)
        
        # Преобразуем в объекты CategoryCompletionStats
        items = [
            CategoryCompletionStats(
                category_id=stat['category_id'],
                category_name=stat['category_name'],
                completed_count=stat['completed_count'],
                total_count=stat['total_count'],
                percentage=stat['percentage'],
            )
            for stat in stats
        ]
        
        return CategoryCompletionStatsListResponse(items=items)
    except Exception as e:
        log.error(f"❌ Ошибка при получении статистики по категориям: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении статистики по категориям",
        )
