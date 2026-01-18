"""Конфигурация базы данных."""

from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings


class DatabaseSettings(BaseSettings):
    """Настройки базы данных."""
    
    # PostgreSQL
    db_host: str = Field(
        default="postgres", 
        description="Хост базы данных",
    )
    db_port: int = Field(
        default=5432, 
        description="Порт базы данных",
    )
    db_user: str = Field(
        default="postgres", 
        description="Пользователь базы данных",
    )
    db_password: str = Field(
        default="postgres", 
        description="Пароль базы данных",
    )
    db_name: str = Field(
        default="interview_notes", 
        description="Имя базы данных",
    )
    
    # Connection pool settings
    db_pool_size: int = Field(
        default=20, 
        description="Размер пула соединений",
    )
    db_max_overflow: int = Field(
        default=10, 
        description="Максимальное переполнение пула",
    )
    db_pool_timeout: int = Field(
        default=30, description="Таймаут пула в секундах",
    )
    db_pool_recycle: int = Field(
        default=1800, description="Время жизни соединения в секундах",
    )
    db_pool_pre_ping: bool = Field(
        default=True, description="Включить авто-проверку соединений",
    )
    
    # Database URLs
    @property
    def database_url(self) -> str:
        """Получить URL для подключения к базе данных."""
        return (
            f"postgresql+asyncpg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Игнорировать лишние переменные


@lru_cache()
def get_database_settings() -> DatabaseSettings:
    """Получить кешированные настройки приложения."""
    return DatabaseSettings()
