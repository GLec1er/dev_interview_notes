from typing import List, Dict, Any

from app.db.models.question import ContentType, ProgrammingLanguage


def validate_content_structure(
    contents: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Валидирует структуру блоков контента."""
    if not isinstance(contents, list):
        raise ValueError("contents должен быть списком")
        
    for block in contents:
        if not isinstance(block, dict):
                raise ValueError("Каждый блок должен быть словарем")
            
        if 'type' not in block:
            raise ValueError("Блок должен иметь поле 'type'")
            
        if block['type'] not in [t.value for t in ContentType]:
            raise ValueError(f"Неверный тип блока: {block['type']}")
            
        # Валидация специфичных полей для разных типов
        if block['type'] == ContentType.CODE.value:
            if 'language' not in block:
                # Если язык не указан, по умолчанию ставим TEXT (мутирование входных данных)
                block['language'] = ProgrammingLanguage.TEXT.value
            if 'code' not in block:
                raise ValueError("Код-блок должен содержать поле 'code'")

    return contents
