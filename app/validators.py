from typing import List, Dict, Any

from app.db.models.question import ContentType, ProgrammingLanguage
from app.core.loggers import log


def validate_content_structure(
    contents: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Валидирует структуру блоков контента."""
    if not isinstance(contents, list):
        raise ValueError("contents должен быть списком")

    for block in contents:
        if not isinstance(block, dict):
            raise ValueError("Каждый блок должен быть словарем")

        # Проверка обязательных полей
        if 'type' not in block:
            raise ValueError("Блок должен иметь поле 'type'")

        # Проверка типа блока
        if block['type'] not in [t.value for t in ContentType]:
            raise ValueError(f"Неверный тип блока: {block['type']}")

        # Валидация специфичных полей для разных типов
        if block['type'] == ContentType.CODE.value:
            # Проверка наличия data
            if 'data' not in block or not isinstance(block['data'], dict):
                raise ValueError("Code-блок должен содержать поле 'data' (словарь)")
            
            # Проверка наличия кода в data
            if 'code' not in block['data']:
                raise ValueError("Code-блок должен содержать поле 'data.code'")

            # Установка языка по умолчанию
            if 'language' not in block['data']:
                raise ValueError(f"Нет блока language: {block['language']}")
            elif block['data']['language'] not in [lang.value for lang in ProgrammingLanguage]:
                raise ValueError(f"Неверный язык программирования: {block['language']}")

    return contents
