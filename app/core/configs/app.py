"""Конфигурация приложения."""

import os
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class AppSettings(BaseSettings):
    """Настройки приложения."""
    
    # Основные настройки
    app_name: str = Field(
        default="Interview Notes API", 
        description="Название приложения",
        alias="APP_NAME"
    )
    app_version: str = Field(
        default="0.1.0", 
        description="Версия приложения",
        alias="APP_VERSION"
    )
    app_description: str = Field(
        default="API для управления заметками собеседований",
        description="Описание приложения",
        alias="APP_DESCRIPTION"
    )
    
    # Сервер
    host: str = Field(
        default="0.0.0.0", 
        description="Хост сервера",
        alias="HOST"
    )
    port: int = Field(
        default=8888, 
        description="Порт сервера",
        alias="PORT"
    )
    
    # Режим работы
    debug: bool = Field(
        default=True, 
        description="Режим отладки",
        alias="DEBUG"
    )
    environment: str = Field(
        default="development", 
        description="Окружение",
        alias="ENVIRONMENT"
    )
    log_level: str = Field(
        default="INFO", 
        description="Уровень логирования",
        alias="LOG_LEVEL"
    )
    
    # CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173", "http://158.160.203.217:5173"],
        description="Разрешенные CORS origins",
        alias="CORS_ORIGINS"
    )
    cors_allow_credentials: bool = Field(
        default=True, 
        description="Разрешить credentials в CORS",
        alias="CORS_ALLOW_CREDENTIALS"
    )
    cors_allow_methods: List[str] = Field(
        default=["*"], 
        description="Разрешенные методы CORS",
        alias="CORS_ALLOW_METHODS"
    )
    cors_allow_headers: List[str] = Field(
        default=["*"], 
        description="Разрешенные заголовки CORS",
        alias="CORS_ALLOW_HEADERS"
    )
    
    # API ROUTE
    api_prefix: str = Field(
        default="/api/v1", 
        description="Префикс API",
        alias="API_PREFIX"
    )
    
    @field_validator('cors_origins', 'cors_allow_methods', 'cors_allow_headers', mode='before')
    @classmethod
    def parse_list(cls, value):
        if isinstance(value, str):
            import json
            return json.loads(value)
        return value
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Игнорировать лишние переменные


@lru_cache()
def get_app_settings() -> AppSettings:
    """Получить кешированные настройки приложения."""
    return AppSettings()
