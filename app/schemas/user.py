from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import ClassVar, Optional
from uuid import UUID

from app.core.configs.init import settings
from app.db.models.auth import UserRole


# ==================== Main Schema ====================
class UserBase(BaseModel):
    """
    Базовая схема пользователя
    Ипользуется для общих полей пользователя (for response models).
    """
    first_name: str = Field(
        ..., 
        min_length=2, 
        max_length=100,
        description="Имя пользователя"
    )
    last_name: str = Field(
        ..., 
        min_length=2, 
        max_length=100,
        description="Фамилия пользователя"
    )
    email: EmailStr = Field(
        ...,
        description="Email пользователя"
    )


# ==================== Register Schema ====================
class UserCreate(UserBase):
    """Схема для создания пользователя."""
    password: str = Field(
        ..., 
        min_length=8,
        max_length=128,
        description="Пароль пользователя"
    )

    disposable_domains: ClassVar[set[str]] = {
        'tempmail.com', '10minutemail.com', 'guerrillamail.com',
        'mailinator.com', 'yopmail.com', 'dispostable.com',
        'trashmail.com', 'sharklasers.com'
    }
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.islower() for c in v):
            raise ValueError('Пароль должен содержать хотя бы одну строчную букву')
        if not any(c.isupper() for c in v):
            raise ValueError('Пароль должен содержать хотя бы одну заглавную букву')
        if not any(c.isdigit() for c in v):
            raise ValueError('Пароль должен содержать хотя бы одну цифру')
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v):
            raise ValueError('Пароль должен содержать хотя бы один специальный символ')
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email_domain(cls, v: str) -> str:
        local_part, domain = v.rsplit('@', 1)
        domain = domain.lower()

        if domain in cls.disposable_domains:
            raise ValueError('Использование временных email запрещено')

        return v


# ==================== Login Schema ====================
class UserLogin(BaseModel):
    email: EmailStr = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Email пользователя"
    )
    password: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Пароль пользователя"
    )


class UserInternal(BaseModel):
    id: UUID
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    is_active: bool
    failed_login_attempts: int
    locked_until: Optional[datetime]
    last_login: Optional[datetime]

    @field_validator('locked_until', 'last_login', mode='before')
    @classmethod
    def ensure_timezone(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is None:
            return None
        # Если datetime naive (без часового пояса) - добавляем UTC
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    class Config:
        from_attributes = True


# ================ User Schemas ====================
class UserMe(UserBase):
    role: UserRole = Field(
        ..., 
        description="Роль пользователя",
    )
    email_verified: bool = Field(
        ..., 
        description="Подтвержден ли email",
    )
    is_active: bool = Field(
        ..., 
        description="Активен ли пользователь",
    )
    is_admin: bool = Field(
        ..., 
        description="Является ли администратором",
    )
    last_login: Optional[datetime] = Field(None, description="Последний вход")
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


# ==================== Auth Schemas ====================
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = settings.auth.access_token_expire_minutes * 60
