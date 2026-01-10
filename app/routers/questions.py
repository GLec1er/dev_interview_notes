from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.authorizer import Permission, ResourceType, check_permission
from app.db.database import SessionDep
from app.db.models.auth import UserRole
from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryListResponse, CategoryResponse, CategoryUpdate
from app.schemas.question import QuestionFilterParams, QuestionSortParams, QuestionUpdateResponse
from app.services.auth import CurrentActiveUser
from app.services.category import CategoryService
from app.services.question import QuestionService
from app.services.answer import AnswerService
from app.schemas.base import PaginationParams
from app.schemas.question import (
    QuestionCreate,
    QuestionListResponse,
    QuestionUpdate,
    QuestionResponse,
)
from app.schemas.answer import (
    AnswerCreate,
    AnswerFilterParams,
    AnswerSortParams,
    AnswerUpdate,
    AnswerResponse,
    AnswerUpdateResponse,
)
from app.core.loggers import log
from app.core.configs.init import settings


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/questions",
    tags=["Questions"],
)


# ==================== Question Endpoints ====================
    
@router.post(
    "/", 
    response_model=QuestionResponse, 
    description="Создание нового вопроса",
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
        return await service.create_question(data)
        
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
        question = await service.get_one(question_id)
        
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


# ==================== Answer Endpoints ====================

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
    

# ==================== Category Management Endpoints ====================

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


# ==================== Question-Category Relationship Endpoints ====================

@router.post(
    "/{question_id}/categories/{category_id}",
    response_model=QuestionResponse,
    description="Добавление категории к вопросу",
)
@check_permission(required_role=UserRole.ADMIN)
async def add_category_to_question(
    current_user: CurrentActiveUser,
    question_id: UUID,
    category_id: UUID,
    session: SessionDep,
):
    """Добавить категорию к вопросу.
    
    Args:
        question_id: UUID вопроса
        category_id: UUID категории
        
    Returns:
        QuestionResponse с обновленным вопросом
        
    Raises:
        HTTPException: Если вопрос или категория не найдены
    """
    try:
        service = QuestionService.from_session(session)
        return await service.add_category_to_question(question_id, category_id)
    except ValueError as e:
        log.warning(f"⚠️ Ошибка при добавлении категории к вопросу: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при добавлении категории к вопросу: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при добавлении категории к вопросу",
        )


@router.delete(
    "/{question_id}/categories/{category_id}",
    response_model=QuestionResponse,
    description="Удаление категории из вопроса",
)
@check_permission(required_role=UserRole.ADMIN)
async def remove_category_from_question(
    current_user: CurrentActiveUser,
    question_id: UUID,
    category_id: UUID,
    session: SessionDep,
):
    """Удалить категорию из вопроса.
    
    Args:
        question_id: UUID вопроса
        category_id: UUID категории
        
    Returns:
        QuestionResponse с обновленным вопросом
        
    Raises:
        HTTPException: Если вопрос или категория не найдены
    """
    try:
        service = QuestionService.from_session(session)
        return await service.remove_category_from_question(question_id, category_id)
    except ValueError as e:
        log.warning(f"⚠️ Ошибка при удалении категории из вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при удалении категории из вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении категории из вопроса",
        )


@router.put(
    "/{question_id}/categories/",
    response_model=QuestionResponse,
    description="Установка категорий для вопроса (замена существующих)",
)
@check_permission(required_role=UserRole.ADMIN)
async def set_question_categories(
    current_user: CurrentActiveUser,
    question_id: UUID,
    category_ids: List[UUID],
    session: SessionDep,
):
    """Установить категории для вопроса.
    
    Args:
        question_id: UUID вопроса
        category_ids: Список ID категорий
        
    Returns:
        QuestionResponse с обновленным вопросом
        
    Raises:
        HTTPException: Если вопрос не найден
    """
    try:
        service = QuestionService.from_session(session)
        return await service.set_question_categories(question_id, category_ids)
    except ValueError as e:
        log.warning(f"⚠️ Ошибка при установке категорий для вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при установке категорий для вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при установке категорий для вопроса",
        )


@router.get(
    "/{question_id}/categories/",
    response_model=List[CategoryResponse],
    description="Получение всех категорий вопроса",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.QUESTION,
)
async def get_question_categories(
    current_user: CurrentActiveUser,
    question_id: UUID,
    session: SessionDep,
):
    """Получить все категории вопроса.
    
    Args:
        question_id: UUID вопроса
        
    Returns:
        Список CategoryResponse
        
    Raises:
        HTTPException: Если вопрос не найден
    """
    try:
        # Проверяем существование вопроса
        question_service = QuestionService.from_session(session)
        question = await question_service.get_one(question_id)
        
        if not question:
            log.warning(f"⚠️ Вопрос не найден: {question_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Вопрос с ID {question_id} не найден",
            )
        
        # Получаем категории через репозиторий
        category_repo = CategoryRepository(session)
        categories = await category_repo.get_categories_for_question(question_id)
        
        return [CategoryResponse.model_validate(cat) for cat in categories]
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при получении категорий вопроса: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении категорий вопроса",
        )
