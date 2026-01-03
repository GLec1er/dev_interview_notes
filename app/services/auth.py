# app/api/dependencies.py
from typing import Optional, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.db.database import SessionDep
from app.db.models.auth import User
from app.core.auth import oauth2_scheme, security, http_bearer
from app.repositories.user import UserRepository


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


# Типы для аннотаций
CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentActiveUser = Annotated[User, Depends(get_current_active_user)]


# Ролевые зависимости
class RoleChecker:
    """Проверка ролей пользователя."""
    
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles
    
    def __call__(self, user: CurrentActiveUser):
        if not user.is_superuser and user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied",
            )
        return user


# Примеры ролей
allow_user = RoleChecker(["user"])
allow_moderator = RoleChecker(["moderator", "admin"])
allow_admin = RoleChecker(["admin"])
allow_super_admin = RoleChecker(["super_admin"])


# Для работы с API ключами
async def get_api_key(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
) -> Optional[str]:
    """Получить API ключ из заголовка."""
    if not credentials:
        return None
    
    # Проверяем API ключ в базе данных или кэше
    # Здесь можно добавить проверку ключа
    return credentials.credentials