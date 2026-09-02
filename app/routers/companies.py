"""Router для работы с компаниями."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.authorizer import Permission, ResourceType, check_permission
from app.db.database import SessionDep
from app.db.models.auth import UserRole
from app.db.models.question import LevelCompanyInterview
from app.schemas.company import (
    CompanyCreate,
    CompanyListResponse,
    CompanyResponse,
    CompanyUpdate,
    CompanyWithQuestionsResponse,
)
from app.schemas.base import PaginationParams
from app.services.auth import CurrentActiveUser
from app.services.company import CompanyService
from app.core.loggers import log
from app.core.configs import settings


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/companies",
    tags=["Companies"],
)


@router.post(
    "/",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED,
    description="Создание новой компании",
)
@check_permission(required_role=UserRole.ADMIN)
async def create_company(
    current_user: CurrentActiveUser,
    data: CompanyCreate,
    session: SessionDep,
):
    """Создать новую компанию.
    
    Args:
        data: Данные для создания компании
        
    Returns:
        CompanyResponse с созданной компанией
        
    Raises:
        HTTPException: Если компания с таким слагом уже существует
    """
    try:
        service = CompanyService.from_session(session)
        return await service.create_company(data)
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при создании компании: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при создании компании: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при создании компании",
        )


@router.get(
    "/",
    response_model=CompanyListResponse,
    description="Получение списка компаний с пагинацией",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.CATEGORY,
)
async def get_companies(
    current_user: CurrentActiveUser,
    session: SessionDep,
    pagination: PaginationParams = Depends(),
    include_inactive: bool = False,
):
    """Получить список компаний.
    
    Args:
        pagination: Параметры пагинации
        include_inactive: Включать неактивные компании
        
    Returns:
        CompanyListResponse со списком компаний
    """
    try:
        service = CompanyService.from_session(session)
        return await service.get_many(
            pagination=pagination,
            include_inactive=include_inactive,
        )
    except Exception as e:
        raise
        log.error(f"❌ Ошибка при получении списка компаний: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении списка компаний",
        )


@router.get(
    "/with-questions",
    response_model=CompanyListResponse,
    description="Получение списка компаний с информацией о количестве вопросов",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.CATEGORY,
)
async def get_companies_with_questions(
    current_user: CurrentActiveUser,
    session: SessionDep,
    pagination: PaginationParams = Depends(),
    include_inactive: bool = False,
    level: LevelCompanyInterview = None,
):
    """Получить список компаний с информацией о количестве вопросов.
    
    Args:
        pagination: Параметры пагинации
        include_inactive: Включать неактивные компании
        
    Returns:
        CompanyListResponse со списком компаний с информацией о вопросах
    """
    try:
        service = CompanyService.from_session(session)
        return await service.get_with_questions(
            level=level,
            current_user=current_user,
            pagination=pagination,
            include_inactive=include_inactive,
        )
    except Exception as e:
        log.error(f"❌ Ошибка при получении списка компаний с вопросами: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении списка компаний",
        )


@router.get(
    "/{company_id}",
    response_model=CompanyResponse,
    description="Получение компании по ID",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.CATEGORY,
)
async def get_company(
    current_user: CurrentActiveUser,
    session: SessionDep,
    company_id: UUID,
):
    """Получить компанию по ID.
    
    Args:
        company_id: UUID компании
        
    Returns:
        CompanyResponse с информацией о компании
        
    Raises:
        HTTPException: Если компания не найдена
    """
    try:
        service = CompanyService.from_session(session)
        company = await service.get_one(company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Компания с ID {company_id} не найдена",
            )
        return company
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка при получении компании: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении компании",
        )


@router.patch(
    "/{company_id}",
    response_model=CompanyResponse,
    description="Обновление компании",
)
@check_permission(required_role=UserRole.ADMIN)
async def update_company(
    current_user: CurrentActiveUser,
    session: SessionDep,
    company_id: UUID,
    data: CompanyUpdate,
):
    """Обновить компанию.
    
    Args:
        company_id: UUID компании
        data: Данные для обновления
        
    Returns:
        CompanyResponse с обновленной компанией
        
    Raises:
        HTTPException: Если компания не найдена или слаг не уникален
    """
    try:
        service = CompanyService.from_session(session)
        return await service.update_company(company_id, data)
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при обновлении компании: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise
        log.error(f"❌ Ошибка при обновлении компании: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при обновлении компании",
        )


@router.delete(
    "/{company_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление компании",
)
@check_permission(required_role=UserRole.ADMIN)
async def delete_company(
    current_user: CurrentActiveUser,
    session: SessionDep,
    company_id: UUID,
):
    """Удалить компанию.
    
    Args:
        company_id: UUID компании
        
    Raises:
        HTTPException: Если компания не найдена
    """
    try:
        service = CompanyService.from_session(session)
        await service.delete_company(company_id)
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при удалении компании: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при удалении компании: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении компании",
        )


@router.get(
    "/{company_id}/questions",
    description="Получение вопросов компании с пагинацией",
)
async def get_company_questions(
    current_user: CurrentActiveUser,
    session: SessionDep,
    company_id: UUID,
    pagination: PaginationParams = Depends(),
):
    """Получить вопросы компании.
    
    Args:
        company_id: UUID компании
        pagination: Параметры пагинации
        
    Returns:
        Список вопросов компании
        
    Raises:
        HTTPException: Если компания не найдена
    """
    try:
        service = CompanyService.from_session(session)
        questions, total = await service.get_company_questions(
            company_id=company_id,
            pagination=pagination,
        )
        return {
            "items": questions,
            "total": total,
            "page": pagination.page_number,
            "page_size": pagination.limit,
        }
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка при получении вопросов компании: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении вопросов компании",
        )
