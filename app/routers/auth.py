from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.auth import SecurityUtils
from app.db.database import SessionDep
from app.repositories.user import UserRepository
from app.schemas.user import (
    UserCreate, 
    UserPublic, 
    Token,
    LoginRequest,
    RefreshTokenRequest,
)
from app.core.loggers import log
from app.core.configs.init import settings
from app.services.auth import CurrentActiveUser
from app.services.user import AuthService


router = APIRouter(
    prefix=f"{settings.app.api_prefix}/auth", 
    tags=["Authentication"],
)


limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("5/minute")  # 5 попыток в минуту
async def register(
    user_data: UserCreate,
    session: SessionDep,
    request: Request,
):
    """Регистрация нового пользователя."""
    try:
        service = AuthService.from_session(session)
        result = await service.register(user_data)

        user = result["user"]
        user_response = {
            "id": str(user.id),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        }

        response = JSONResponse(
            content={
                "user": user_response,
            },
            status_code=status.HTTP_201_CREATED,
        )
        
        # Устанавливаем secure cookies для токенов
        response.set_cookie(
            key="access_token",
            value=result["tokens"].access_token,
            httponly=True,
            secure=True,  # Только HTTPS
            samesite="strict",
            max_age=settings.auth.access_token_expire_minutes * 60,
            path="/",
        )
        
        response.set_cookie(
            key="refresh_token",
            value=result["tokens"].refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=settings.auth.refresh_token_expire_days * 24 * 60 * 60,
            path="/api/auth/refresh",
        )

        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        log.error(f"❌ Ошибка регистрации: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
)
@limiter.limit("10/minute")  # 10 попыток в минуту
async def login(
    login_data: LoginRequest,
    session: SessionDep,
    request: Request,
    response: Response,
):
    """Аутентификация пользователя с защитой от brute-force."""
    try:
        service = AuthService.from_session(session)
        result = await service.login(
            login_data
        )
        
        # Подготавливаем данные пользователя для ответа
        user = result["user"]
        user_response = {
            "id": str(user.id),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "email_verified": getattr(user, 'email_verified', False),
            "role": str(getattr(user, 'role', 'user')),
        }
        
        # Устанавливаем токены в HTTP-only cookies
        tokens = result["tokens"]
        
        # Access token cookie (короткоживущий)
        response.set_cookie(
            key="access_token",
            value=tokens.access_token,
            httponly=True,
            secure=settings.app.environment == "production",
            samesite="strict",
            max_age=settings.auth.access_token_expire_minutes * 60,
            path="/",
        )
        
        # Refresh token cookie (долгоживущий)
        response.set_cookie(
            key="refresh_token",
            value=tokens.refresh_token,
            httponly=True,
            secure=settings.app.environment == "production",
            samesite="strict",
            max_age=settings.auth.refresh_token_expire_days * 24 * 60 * 60,
            path=f"{settings.app.api_prefix}/auth/refresh",  # Только для endpoint обновления
        )
        
        # Возвращаем пользователя в теле ответа
        return {
            "user": user_response,
            "message": "Login successful",
            "token_type": tokens.token_type,
            "expires_in": tokens.expires_in,
        }
        
    except ValueError as e:
        # Всегда возвращаем одну и ту же ошибку для безопасности
        error_message = str(e)
        if "credentials" in error_message.lower():
            error_detail = "Invalid email/username or password"
        else:
            error_detail = error_message
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_detail,
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Неожиданная ошибка при входе: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/refresh")
async def refresh_token(
    request: Request,
    session: SessionDep,
    response: Response,
):
    """Обновление access токена с помощью refresh токена."""
    try:
        # Получаем refresh token из куки или тела запроса
        refresh_token = request.cookies.get("refresh_token")
        
        if not refresh_token:
            # Пробуем получить из тела запроса
            try:
                body = await request.json()
                refresh_token = body.get("refresh_token")
            except:
                pass
        
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required",
            )
        
        # Верифицируем refresh token
        security = SecurityUtils()
        payload = security.verify_token(refresh_token, is_refresh=True)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        
        # Проверяем существование пользователя
        user_repo = UserRepository(session)
        user = await user_repo.get_by(id=user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is inactive",
            )
        
        # Создаем новый access token
        access_token = security.create_access_token(
            data={"sub": str(user.id)}
        )
        
        # Обновляем куку с access token
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.app.environment == "production",
            samesite="strict",
            max_age=settings.auth.access_token_expire_minutes * 60,
            path="/",
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.auth.access_token_expire_minutes * 60,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка обновления токена: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed",
        )
    

@router.post("/logout")
async def logout(
    response: Response,
):
    """Выход из системы - очистка всех токенов."""
    # Очищаем все куки аутентификации
    cookies_to_clear = ["access_token", "refresh_token", "token_type"]
    
    for cookie_name in cookies_to_clear:
        response.delete_cookie(
            key=cookie_name,
            path="/",
        )
    
    return {
        "message": "Successfully logged out",
        "redirect_to": "/login",  # Для фронтенда
    }


@router.get(
    "/me",
    response_model=UserPublic,
)
async def get_current_user_info(
    current_user: CurrentActiveUser,
):
    """Получить информацию о текущем пользователе."""
    return current_user
