from typing import Optional, Annotated
from fastapi import Depends, HTTPException, Response, status

from app.db.database import SessionDep
from app.db.models.auth import User
from app.core.auth import oauth2_scheme, security
from app.repositories.user import UserRepository
from app.core.configs import settings


async def set_cookies(
    response: Response,
    access_token: str | None = None,
    refresh_token: str | None = None,
):
    """
    Установить HTTP-only куки для access и refresh токенов.
    """
    if access_token:
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.app.environment == "production",
            samesite="lax",  # Changed from "strict" to "lax" for better compatibility
            max_age=settings.auth.access_token_expire_minutes * 60,
            path="/",
        )

    if refresh_token:  
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.app.environment == "production",
            samesite="lax",  # Changed from "strict" to "lax" for better compatibility
            max_age=settings.auth.refresh_token_expire_days * 24 * 60 * 60,
            path="/",
        )


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    session: SessionDep = None,
) -> Optional[User]:
    """
    Получить текущего пользователя по JWT токену.
    Возвращает None, если пользователь не аутентифицирован.
    """
    if not token:
        return None
    
    try:
        payload = security.verify_token(token)
        user_id: str = payload.get("sub")
        
        if user_id is None:
            return None
        
        repository = UserRepository(session)
        user = await repository.get(user_id)
        
        if user is None or not user.is_active:
            return None
        
        return user
        
    except HTTPException:
        return None
    except Exception:
        return None


async def get_current_active_user(
    current_user: Optional[User] = Depends(get_current_user),
) -> User:
    """Получить текущего активного пользователя (обязательная аутентификация)."""
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    return current_user


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentActiveUser = Annotated[User, Depends(get_current_active_user)]
