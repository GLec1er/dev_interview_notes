"""Pydantic схемы для валидации данных."""

from enum import Enum

from pydantic import BaseModel, Field, field_validator

from app.core.loggers import log


# ==================== Pagination and Sorting Schemas ====================
class SortDirection(str, Enum):
    """Направление сортировки."""
    ASC = "asc"
    DESC = "desc"


class PaginationParams(BaseModel):
    limit: int = Field(
        default=100, 
        gt=0, 
        description="Количество записей на странице",
    )
    page_number: int = Field(
        default=1, 
        gt=0, 
        description="Номер страницы",
    )
    
    @field_validator('limit')
    def validate_limit(cls, v):
        if v > 1000:
            log.warning("Лимит запрошен слишком большой, ограничиваем 1000")
            return 1000
        return v

    class Config:
        extra = "forbid" # Запретить дополнительные поля


class SortMixin(BaseModel):
    """Миксин для сортировки."""
    sort_by: str = "created_at"
    sort_dir: SortDirection = SortDirection.DESC
    
    @property
    def model(self):
        """Модель должна быть определена в дочернем классе."""
        raise NotImplementedError
