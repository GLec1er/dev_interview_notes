"""Утилиты для работы с данными."""
import json
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
from typing import Any
from enum import Enum
from slugify import slugify
from fastapi.responses import JSONResponse as FastAPIJSONResponse


def generate_slug(text: str) -> str:
    """Генерировать slug из текста."""
    return slugify(text, language="en")


class CustomJSONEncoder(json.JSONEncoder):
    """Кастомный JSON encoder для поддержки UUID, datetime и других типов."""
    
    def default(self, obj: Any) -> Any:
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, date):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, Enum):
            return obj.value
        if hasattr(obj, '__dict__'):
            return {k: v for k, v in obj.__dict__.items() if not k.startswith('_')}
        return super().default(obj)


class JSONResponse(FastAPIJSONResponse):
    """Кастомный JSON Response с поддержкой UUID."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def render(self, content: Any) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
            cls=CustomJSONEncoder,
        ).encode("utf-8")
