from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.authorizer import Permission, ResourceType, check_permission
from app.db.database import SessionDep
from app.db.models.auth import UserRole
from app.services.auth import CurrentActiveUser
from app.services.answer import AnswerService
from app.schemas.base import PaginationParams
from app.schemas.answer import (
    AnswerCreate,
    AnswerFilterParams,
    AnswerSortParams,
    AnswerUpdate,
    AnswerResponse,
    AnswerUpdateResponse,
)
from app.core.loggers import log
from app.core.configs import settings


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/questions",
    tags=["Answers"],
)

@router.post(
    "/{question_id}/answers/", 
    response_model=AnswerResponse, 
    status_code=status.HTTP_201_CREATED,
    description="Создание нового ответа на вопрос",
)
@check_permission(required_role=UserRole.ADMIN)
async def create_answer(
    current_user: CurrentActiveUser,
    question_id: UUID,
    data: AnswerCreate,
    session: SessionDep,
):
    """Создать ответ на вопрос.
    
    Args:
        question_id: UUID вопроса
        data: Данные для создания ответа
        session: Сессия БД
        
    Returns:
        AnswerResponse с созданным ответом
        
    Raises:
        HTTPException: Если вопрос не найден
    """
    try:
        service = AnswerService.from_session(session)
        answer = await service.create_answer(
            question_id, 
            data,
        )
        return answer
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при создании ответа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при создании ответа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при создании ответа",
        )


@router.get(
    "/{question_id}/answers/", 
    response_model=list[AnswerResponse],
    description="Получение всех ответов на вопрос",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.ANSWER,
)
async def get_answers(
    current_user: CurrentActiveUser,
    session: SessionDep,
    question_id: UUID,
    filters: AnswerFilterParams = Depends(),
    sort: AnswerSortParams = Depends(),
    pagination: PaginationParams = Depends(),
) -> list[AnswerResponse]:
    """Получить все ответы на вопрос.
    
    Args:
        question_id: UUID вопроса
        session: Сессия БД
        filters: Параметры фильтрации
        sort: Параметры сортировки
        pagination: Параметры пагинации
        
    Returns:
        Список AnswerResponse
        
    Raises:
        HTTPException: Если вопрос не найден
    """
    try:
        service = AnswerService.from_session(session)
        answers = await service.get_answers_by_question(
            question_id=question_id,
            filters=filters,
            sort=sort,
            pagination=pagination,
        )
        return answers
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при получении ответов: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при получении ответов: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении ответов",
        )


@router.get(
    "/{question_id}/answers/{answer_id}", 
    response_model=AnswerResponse,
    description="Получение ответа по ID",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.ANSWER,
)
async def get_answer(
    current_user: CurrentActiveUser,
    question_id: UUID,
    answer_id: UUID,
    session: SessionDep,
) -> AnswerResponse:
    """Получить ответ по ID.
    
    Args:
        question_id: UUID вопроса
        answer_id: UUID ответа
        session: Сессия БД
        
    Returns:
        AnswerResponse
        
    Raises:
        HTTPException: Если ответ не найден или не принадлежит вопросу
    """
    try:
        service = AnswerService.from_session(session)
        answer = await service.get_answer(answer_id)
        
        if not answer:
            log.warning(f"⚠️ Ответ не найден: {answer_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ответ с ID {answer_id} не найден",
            )
        
        # Проверка, что ответ принадлежит вопросу
        if answer.question_id != question_id:
            log.warning(f"⚠️ Ответ {answer_id} не принадлежит вопросу {question_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ответ с ID {answer_id} не найден для вопроса {question_id}",
            )
        
        return answer
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при получении ответа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении ответа",
        )


@router.put(
    "/{question_id}/answers/{answer_id}", 
    response_model=AnswerUpdateResponse,
    description="Обновление ответа по ID",
)
@check_permission(required_role=UserRole.ADMIN)
async def update_answer(
    current_user: CurrentActiveUser,
    question_id: UUID,
    answer_id: UUID,
    data: AnswerUpdate,
    session: SessionDep,
):
    """Обновить ответ.
    
    Args:
        question_id: UUID вопроса
        answer_id: UUID ответа
        data: Данные для обновления
        session: Сессия БД
        
    Returns:
        AnswerUpdateResponse с обновленным ответом
        
    Raises:
        HTTPException: Если ответ не найден или не принадлежит вопросу
    """
    try:
        service = AnswerService.from_session(session)
        
        # Проверка, что ответ принадлежит вопросу
        answer = await service.get_answer(answer_id)
        if not answer or answer.question_id != question_id:
            log.warning(f"⚠️ Ответ {answer_id} не найден для вопроса {question_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ответ с ID {answer_id} не найден для вопроса {question_id}",
            )
        
        updated_answer = await service.update_answer(
            answer_id, 
            data,
        )
        
        if not updated_answer:
            log.warning(f"⚠️ Ответ не найден для обновления: {answer_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ответ с ID {answer_id} не найден",
            )
        
        return updated_answer
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при обновлении ответа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при обновлении ответа",
        )


@router.delete(
    "/{question_id}/answers/{answer_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление ответа по ID",
)
@check_permission(required_role=UserRole.ADMIN)
async def delete_answer(
    current_user: CurrentActiveUser,
    question_id: UUID,
    answer_id: UUID,
    session: SessionDep,
) -> None:
    """Удалить ответ.
    
    Args:
        question_id: UUID вопроса
        answer_id: UUID ответа
        session: Сессия БД
        
    Raises:
        HTTPException: Если ответ не найден или не принадлежит вопросу
    """
    try:
        service = AnswerService.from_session(session)
        
        # Проверка, что ответ принадлежит вопросу
        answer = await service.get_answer(answer_id)
        if not answer or answer.question_id != question_id:
            log.warning(f"⚠️ Ответ {answer_id} не найден для вопроса {question_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ответ с ID {answer_id} не найден для вопроса {question_id}",
            )
        
        deleted = await service.delete_answer(answer_id)
        
        if not deleted:
            log.warning(f"⚠️ Ответ не найден для удаления: {answer_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ответ с ID {answer_id} не найден",
            )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при удалении ответа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении ответа",
        )
