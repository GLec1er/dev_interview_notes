from fastapi import APIRouter, HTTPException, Request, Response, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.auth import security
from app.core.authorizer import (
    Permission, 
    ResourceType, 
    check_permission,
)
from app.db.database import SessionDep
from app.db.models.auth import UserRole
from app.repositories.user import UserRepository
from app.schemas.user import (
    UserBase,
    UserCreate, 
    UserLogin,
    UserMe,
    UserUpdate,
)
from app.core.loggers import log
from app.core.configs.init import settings
from app.services.auth import set_cookies, CurrentActiveUser
from app.services.user import AuthService


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/auth", 
    tags=["Authentication"],
)


limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserBase,
    summary="Регистрация нового пользователя",
    description="Создает новый аккаунт пользователя с валидацией данных",
)
@limiter.limit("5/minute")  # 5 попыток в минуту
async def register(
    user_data: UserCreate,
    session: SessionDep,
    request: Request,
):
    """
    Регистрация нового пользователя.
    """
    try:
        service = AuthService.from_session(session)
        return await service.register(user_data)
        
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при регистрации: {str(e)[:100]}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Неожиданная ошибка регистрации: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    response_model=UserBase,
    summary="Аутентификация пользователя",
    description="Проверяет учетные данные и выдает токены доступа",
)
@limiter.limit("10/minute")  # 10 попыток в минуту
async def login(
    login_data: UserLogin,
    session: SessionDep,
    request: Request,
    response: Response,
):
    """
    Аутентификация пользователя
    """
    try:
        service = AuthService.from_session(session)
        result = await service.login(login_data)
        
        # Устанавливаем токены в HTTP-only cookies
        await set_cookies(
            response=response,
            access_token=result["tokens"].access_token,
            refresh_token=result["tokens"].refresh_token,
        )
        
        return result["user"]
        
    except ValueError as e:
        log.warning(f"⚠️ Неудачная попытка входа: {str(e)[:50]}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        log.error(f"❌ Неожиданная ошибка при входе: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    response_model=str,
    summary="Обновление access токена",
    description="Выдает новый access токен на основе refresh токена",
)
@limiter.limit("20/minute")  # 20 попыток в минуту
async def refresh_token(
    request: Request,
    session: SessionDep,
    response: Response,
):
    """
    Обновление access токена с помощью refresh токена.
    """
    try:
        # Получаем refresh token из куки
        refresh_token_value = request.cookies.get("refresh_token")
        
        if not refresh_token_value:
            log.warning("⚠️ Попытка обновления токена без refresh токена")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required",
            )
        
        # Верифицируем refresh token
        payload = security.verify_token(
            refresh_token_value, 
            is_refresh=True,
        )
        user_id = payload.get("sub")
        
        if not user_id:
            log.warning("⚠️ Невалидный refresh токен (отсутствует user_id)")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        
        # Проверяем существование пользователя
        user_repo = UserRepository(session)
        user = await user_repo.get_by(id=user_id)
        
        if not user:
            log.warning(f"⚠️ Пользователь не найден при обновлении токена: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        if not user.is_active:
            log.warning(f"⚠️ Попытка обновления токена неактивным пользователем: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is inactive",
            )
        
        # Создаем новый access token
        access_token = security.create_access_token(
            data={"sub": str(user.id)}
        )
        
        # Обновляем куку с access token
        await set_cookies(
            response=response,
            access_token=access_token,
            refresh_token=None
        )
        
        log.info(f"✅ Токен обновлен для пользователя: {user.email}")
        
        return access_token
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка обновления токена: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed",
        )
    

@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    response_model=dict,
    summary="Выход из системы",
    description="Очищает все токены аутентификации",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.UPDATE,
    resource_type=ResourceType.USER,
)
async def logout(
    current_user: CurrentActiveUser,
    response: Response,
):
    """
    Выход из системы - очистка всех токенов.
    """
    # Очищаем все куки аутентификации
    cookies_to_clear = [
        "access_token", 
        "refresh_token", 
    ]
    
    for cookie_name in cookies_to_clear:
        response.delete_cookie(
            key=cookie_name,
            path="/",
        )
    
    log.info(f"✅ Пользователь вышел из системы: {current_user.email}")
    
    return {
        "message": "Successfully logged out",
        "redirect_to": "/login",
    }


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    response_model=UserMe,
    summary="Получить текущего пользователя",
    description="Возвращает информацию о текущем аутентифицированном пользователе",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.READ,
    resource_type=ResourceType.USER,
)
async def get_current_user(
    current_user: CurrentActiveUser,
):
    """
    Получить информацию о текущем пользователе.
    """
    return current_user


@router.put(
    "/me",
    status_code=status.HTTP_200_OK,
    response_model=UserBase,
    summary="Обновить профиль пользователя",
    description="Обновление доступных полей профиля текущего пользователя",
)
@check_permission(
    required_role=UserRole.USER,
    required_permission=Permission.UPDATE,
    resource_type=ResourceType.USER,
)
async def update_profile(
    update_data: UserUpdate,
    current_user: CurrentActiveUser,
    session: SessionDep,
):
    """
    Обновление профиля пользователя.
    """
    try:
        update_dict = update_data.model_dump(exclude_unset=True,)
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields provided for update",
            )
        
        user_repo = UserRepository(session)
        updated_user = await user_repo.update(
            current_user, 
            update_dict,
        )
        await session.commit()
        log.info(f"✅ Профиль пользователя обновлен: {current_user.email}")
        
        return updated_user
        
    except HTTPException:
        raise
    except ValueError as e:
        log.warning(f"⚠️ Ошибка валидации при обновлении профиля: {str(e)[:100]}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка обновления профиля: {e}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed",
        )
