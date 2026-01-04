"""Конфигурация авторизации/аутентификации."""

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings
from functools import lru_cache


class AuthSettings(BaseSettings):
    """Настройки приложения."""
    
    secret_key: SecretStr = Field(
        default=SecretStr("secretkey1234567890"),
        description="Секретный ключ для JWT",
    )
    algorithm: str = Field(
        default="HS256", 
        description="Алгоритм шифрования",
    )
    access_token_expire_minutes: int = Field(
        default=30, 
        description="Время жизни токена в минутах",
    )
    refresh_token_expire_days: int = Field(
        default=7, 
        description="Время жизни refresh токена в днях",
    )
    refresh_secret_key: SecretStr = Field(
        default=SecretStr("refreshsecretkey1234567890"),
        description="Секретный ключ для refresh JWT",
    )

    # Settings for LOGIN
    max_failed_attempts: int = Field(
        default=5,
        description="Лимит попыток",
    )
    lock_duration_minutes: int = Field(
        default=15,
        description="Длительность блокировки в минутах"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_auth_settings() -> AuthSettings:
    """Получить кешированные настройки приложения."""
    return AuthSettings()
