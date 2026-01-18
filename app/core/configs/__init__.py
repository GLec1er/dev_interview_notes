"""Основной модуль конфигурации."""

from pathlib import Path
from functools import lru_cache
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
# Путь: от configs/__init__.py нужно подняться на 3 уровня вверх
# configs -> core -> app -> корень проекта
env_path = Path(__file__).parent.parent.parent.parent / '.env'
load_dotenv(env_path)
load_dotenv()

from app.core.configs.app import get_app_settings
from app.core.configs.database import get_database_settings
from app.core.configs.auth import get_auth_settings
from app.core.configs.email import get_email_settings


class Settings:
    """Основные настройки приложения."""
    
    def __init__(self):
        self.app = get_app_settings()
        self.database = get_database_settings()
        self.auth = get_auth_settings()
        self.email = get_email_settings()
    
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