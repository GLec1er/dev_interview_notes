from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.authorizer import Permission, ResourceType, check_permission
from app.db.database import SessionDep
from app.db.models.auth import UserRole
from app.schemas.question import QuestionFilterParams, QuestionSortParams, QuestionUpdateResponse
from app.services.auth import CurrentActiveUser
from app.services.question import QuestionService
from app.schemas.base import PaginationParams
from app.schemas.question import (
    QuestionCreate,
    QuestionListResponse,
    QuestionUpdate,
    QuestionResponse,
)
from app.core.loggers import log
from app.core.configs import settings


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/questions",
    tags=["Questions"],
)


# ==================== Question Endpoints ====================
    
@router.post(
    "/", 
    response_model=QuestionResponse, 
    description="Создание нового вопроса - таблица Question",
)
@check_permission(required_role=UserRole.ADMIN)
async def create_question(
    current_user: CurrentActiveUser,
    data: QuestionCreate,
    session: SessionDep,
):
    """Создание нового вопроса.
    
    Args:
        data: Данные для создания вопроса
        session: Сессия БД
        
    Returns:
        QuestionResponse с созданным вопросом
        
    Raises:
        HTTPException: Если вопрос с таким слагом уже существует
    """
    try:
        service = QuestionService.from_session(session)     
        return await service.create_question(data, current_user)
        
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при создании вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при создании вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при создании вопроса",
        )


@router.get(
    "/", 
    response_model=QuestionListResponse,
    description="Получение списка вопросов с фильтрацией, сортировкой и пагинацией",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def get_questions(
    current_user: CurrentActiveUser,
    session: SessionDep,
    filters: QuestionFilterParams = Depends(),
    sort: QuestionSortParams = Depends(),
    pagination: PaginationParams = Depends(),
):
    """Получить список вопросов с фильтрацией, сортировкой и пагинацией."""
    try:
        service = QuestionService.from_session(session)
        question_list, total = await service.get_many(
            current_user_id=current_user.id,
            filters=filters, 
            sort=sort, 
            pagination=pagination,
        )
        return QuestionListResponse(
            items=question_list, 
            total=total,
        )
        
    except Exception as e:
        log.error(f"❌ Ошибка при получении списка вопросов: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении списка вопросов",
        )


@router.get(
    "/{question_id}", 
    response_model=QuestionResponse,
    description="Получение вопроса по ID",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def get_question(
    current_user: CurrentActiveUser,
    question_id: UUID,
    session: SessionDep,
):
    """Получить вопрос по ID.
    
    Args:
        question_id: UUID вопроса
        session: Сессия БД
        
    Returns:
        QuestionResponse
        
    Raises:
        HTTPException: Если вопрос не найден
    """
    try:
        service = QuestionService.from_session(session)
        question = await service.get_one(question_id, current_user.id)
        
        if not question:
            log.warning(f"⚠️ Вопрос не найден: {question_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Вопрос с ID {question_id} не найден",
            )
        
        return question
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при получении вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении вопроса",
        )


@router.put(
    "/{question_id}", 
    response_model=QuestionUpdateResponse,
    description="Обновление вопроса по ID",
)
@check_permission(required_role=UserRole.ADMIN)
async def update_question(
    current_user: CurrentActiveUser,
    question_id: UUID,
    data: QuestionUpdate,
    session: SessionDep,
):
    """Обновить вопрос.
    
    Args:
        question_id: UUID вопроса
        data: Данные для обновления
        session: Сессия БД
        
    Returns:
        QuestionResponse с обновленным вопросом
        
    Raises:
        HTTPException: Если вопрос не найден или ошибка валидации
    """
    try:
        service = QuestionService.from_session(session)
        question = await service.update_question(
            question_id, 
            data,
            current_user.id
        )
        
        if not question:
            log.warning(f"⚠️ Вопрос не найден для обновления: {question_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Вопрос с ID {question_id} не найден",
            )
        
        return question
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при обновлении вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при обновлении вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при обновлении вопроса",
        )

@router.delete(
    "/{question_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление вопроса по ID",
)
@check_permission(required_role=UserRole.ADMIN)
async def delete_question(
    current_user: CurrentActiveUser,
    question_id: UUID,
    session: SessionDep,
) -> None:
    """Удалить вопрос.
    
    Args:
        question_id: UUID вопроса
        session: Сессия БД
        
    Raises:
        HTTPException: Если вопрос не найден
    """
    try:
        service = QuestionService.from_session(session)
        deleted = await service.delete_question(question_id)
        
        if not deleted:
            log.warning(f"⚠️ Вопрос не найден для удаления: {question_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Вопрос с ID {question_id} не найден",
            )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при удалении вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении вопроса",
        )
