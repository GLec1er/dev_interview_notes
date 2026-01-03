"""Конфигурация приложения."""

from pydantic import Field
from pydantic_settings import BaseSettings
from functools import lru_cache


class AppSettings(BaseSettings):
    """Настройки приложения."""
    
    # Основные настройки
    app_name: str = Field(
        default="Interview Notes API", 
        description="Название приложения",
    )
    app_version: str = Field(
        default="0.1.0", 
        description="Версия приложения",
    )
    app_description: str = Field(
        default="API для управления заметками собеседований",
        description="Описание приложения"
    )
    
    # Сервер
    host: str = Field(
        default="0.0.0.0", 
        description="Хост сервера",
        )
    port: int = Field(
        default=8888, 
        description="Порт сервера",
    )
    
    # Режим работы
    debug: bool = Field(
        default=True, 
        description="Режим отладки",
    )
    environment: str = Field(
        default="development", 
        description="Окружение",
    )
    log_level: str = Field(
        default="INFO", 
        description="Уровень логирования",
    )
    
    # CORS
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        description="Разрешенные CORS origins"
    )
    cors_allow_credentials: bool = Field(
        default=True, 
        description="Разрешить credentials в CORS",
    )
    cors_allow_methods: list[str] = Field(
        default=["*"], 
        description="Разрешенные методы CORS",
    )
    cors_allow_headers: list[str] = Field(
        default=["*"], 
        description="Разрешенные заголовки CORS",
    )
    
    # API ROUTE
    api_prefix: str = Field(
        default="/api/v1", 
        description="Префикс API",
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_app_settings() -> AppSettings:
    """Получить кешированные настройки приложения."""
    return AppSettings()
