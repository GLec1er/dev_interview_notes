# app/schemas/user.py
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from typing import Optional
from uuid import UUID

from app.core.configs.init import settings


# ==================== Main Schemas ====================
class UserBase(BaseModel):
    """Базовая схема пользователя."""
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


class UserCreate(UserBase):
    """Схема для создания пользователя."""
    password: str = Field(
        ..., 
        min_length=8,
        max_length=128,
        description="Пароль пользователя"
    )
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Пароль должен содержать минимум 8 символов')
        if not any(char.isdigit() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну цифру')
        if not any(char.isupper() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну заглавную букву')
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email_domain(cls, v: str) -> str:
        # Проверка disposable email
        disposable_domains = [
            'tempmail.com', '10minutemail.com', 'guerrillamail.com'
        ]
        domain = v.split('@')[-1].lower()
        if domain in disposable_domains:
            raise ValueError('Использование временных email запрещено')
        return v
    

class UserInDB(UserBase):
    id: UUID
    is_active: bool
    is_admin: bool
    email_verified: bool = False
    
    class Config:
        from_attributes = True


class UserPublic(UserInDB):
    pass

# ================ User Schemas ====================

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


class TokenPayload(BaseModel):
    sub: str  # user_id
    exp: int
    type: str  # "access" или "refresh"
    scopes: list[str] = []


class LoginRequest(BaseModel):
    email: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="email"
    )
    password: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Пароль пользователя"
    )


class RefreshTokenRequest(BaseModel):
    refresh_token: str