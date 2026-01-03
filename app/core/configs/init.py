"""Основной модуль конфигурации."""

from functools import lru_cache
from app.core.configs.app import get_app_settings
from app.core.configs.database import get_database_settings
from app.core.configs.auth import get_auth_settings


class Settings:
    """Основные настройки приложения."""
    
    def __init__(self):
        self.app = get_app_settings()
        self.database = get_database_settings()
        self.auth = get_auth_settings()
    
    @property
    def is_production(self) -> bool:
        """Проверка, является ли окружение production."""
        return self.app.environment.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Проверка, является ли окружение development."""
        return self.app.environment.lower() == "development"
    
    @property
    def is_testing(self) -> bool:
        """Проверка, является ли окружение testing."""
        return self.app.environment.lower() == "testing"


@lru_cache()
def get_settings() -> Settings:
    """Получить кешированные настройки."""
    return Settings()


settings = get_settings()