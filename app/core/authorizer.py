"""
Система контроля доступа (Role-Based Access Control).
Универсальный валидатор прав доступа для эндпоинтов.
"""

from enum import Enum
from functools import wraps
from typing import Callable, Optional
from fastapi import Depends, HTTPException, status
from app.db.models.auth import User, UserRole
from app.core.loggers import log
from app.services.auth import CurrentActiveUser


class Permission(str, Enum):
    """Разрешения (permissions)."""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    ADMIN = "admin"


class ResourceType(str, Enum):
    """Типы ресурсов."""
    USER = "user"
    QUESTION = "question"
    ANSWER = "answer"
    ADMIN_PANEL = "admin_panel"


class Authorizer:
    """
    Универсальный валидатор прав доступа для эндпоинтов.
    
    Поддерживает проверку:
    - Ролей (admin, moderator, user)
    - Разрешений (create, read, update, delete)
    - Контекстных правил (владелец ресурса)
    
    Примеры использования:
    
    1. Проверка роли:
        authorizer.check_role(
            user, 
            UserRole.ADMIN,
        )
    
    2. Проверка разрешения:
        authorizer.check_permission(
            user, 
            Permission.DELETE, 
            ResourceType.QUESTION,
        )
    
    3. Комбинированная проверка:
        authorizer.check_access(
            user=user,
            required_role=UserRole.ADMIN,
            required_permission=Permission.DELETE,
            resource_type=ResourceType.QUESTION
        )
    """
    
    # Матрица разрешений: роль -> ресурс -> разрешения
    ROLE_PERMISSIONS = {
        UserRole.USER: {
            ResourceType.QUESTION: [
                Permission.READ,
            ],
            ResourceType.ANSWER: [
                Permission.READ,
            ],
            ResourceType.USER: [
                Permission.READ,
                Permission.UPDATE,
            ],
        },
    }
    
    @staticmethod
    def check_role(
        user: User,
        required_role: UserRole,
        raise_exception: bool = True,
    ) -> bool:
        """
        Проверить роль пользователя.
        
        Args:
            user: Объект пользователя
            required_role: Требуемая роль
            raise_exception: Выбросить исключение при отсутствии доступа
            
        Returns:
            True если роль совпадает, False иначе
            
        Raises:
            HTTPException: Если raise_exception=True и доступ запрещен
        """
        has_access = user.role == required_role or user.is_admin
        
        if not has_access and raise_exception:
            log.warning(
                f"🚫 Доступ запрещен: пользователь {user.email} "
                f"не имеет роль {required_role}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role: {required_role}",
            )
        
        return has_access
    
    @staticmethod
    def check_permission(
        user: User,
        permission: Permission,
        resource_type: ResourceType,
        raise_exception: bool = True,
    ) -> bool:
        """
        Проверить разрешение пользователя на ресурс.
        
        Args:
            user: Объект пользователя
            permission: Требуемое разрешение
            resource_type: Тип ресурса
            raise_exception: Выбросить исключение при отсутствии доступа
            
        Returns:
            True если разрешение есть, False иначе
            
        Raises:
            HTTPException: Если raise_exception=True и доступ запрещен
        """
        # Админы имеют все разрешения
        if user.is_admin:
            return True
        
        # Получаем разрешения для роли пользователя
        role_perms = Authorizer.ROLE_PERMISSIONS.get(user.role, {})
        resource_perms = role_perms.get(resource_type, [])
        
        has_access = permission in resource_perms
        
        if not has_access and raise_exception:
            log.warning(
                f"🚫 Доступ запрещен: пользователь {user.email} "
                f"не имеет разрешение {permission} на {resource_type}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission} on {resource_type}",
            )
        
        return has_access

    @staticmethod
    def check_access(
        user: User,
        required_role: Optional[UserRole],
        required_permission: Optional[Permission],
        resource_type: Optional[ResourceType],
        raise_exception: bool = True,
    ) -> bool:
        """
        Комбинированная проверка доступа.
        
        Проверяет все указанные условия (AND логика).
        
        Args:
            user: Объект пользователя
            required_role: Требуемая роль
            required_permission: Требуемое разрешение
            resource_type: Тип ресурса

            raise_exception: Выбросить исключение при отсутствии доступа (опционально)
            
        Returns:
            True если все условия выполнены, False иначе
            
        Raises:
            HTTPException: Если raise_exception=True и доступ запрещен
        """
        try:
            if user.is_admin:
                return True
            
            # Проверка роли
            if required_role:
                Authorizer.check_role(
                    user, 
                    required_role, 
                    raise_exception=True,
                )
            
            # Проверка разрешения
            if required_permission and resource_type:
                Authorizer.check_permission(
                    user, 
                    required_permission, 
                    resource_type, 
                    raise_exception=True
                )
            
            log.debug(f"✅ Доступ разрешен для пользователя {user.email}")
            return True
            
        except HTTPException:
            if raise_exception:
                raise
            return False
    

    # ================================ Check methods ================================ #
    @staticmethod
    def can_perform_action(
        user: User,
        action: Permission,
        resource_type: ResourceType,
    ) -> bool:
        """
        Проверить, может ли пользователь выполнить действие.
        
        Args:
            user: Объект пользователя
            action: Действие (разрешение)
            resource_type: Тип ресурса
            
        Returns:
            True если действие разрешено, False иначе
        """
        try:
            # Проверяем разрешение
            if not Authorizer.check_permission(
                user, 
                action, 
                resource_type, 
                raise_exception=False
            ):
                return False
            
            return True
            
        except Exception as e:
            log.error(f"❌ Ошибка при проверке доступа: {e}")
            return False


authorizer = Authorizer()


def check_permission(
    required_role: Optional[UserRole] = None,
    required_permission: Optional[Permission] = None,
    resource_type: Optional[ResourceType] = None,
):
    """
    Декоратор для проверки прав доступа к эндпоинту.
    
    Args:
        required_role: Требуемая роль
        required_permission: Требуемое разрешение
        resource_type: Тип ресурса
        check_ownership: Проверять ли владение (True если ресурс принадлежит пользователю)
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(
            *args,
            current_user: User = Depends(CurrentActiveUser),
            **kwargs
        ):  
            Authorizer.check_access(
                user=current_user,
                required_role=required_role,
                required_permission=required_permission,
                resource_type=resource_type,
            )
            
            return await func(
                *args, 
                current_user=current_user, 
                **kwargs,
            )
        return wrapper
    return decorator