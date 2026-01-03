# Структура Models и Schemas

## Обзор изменений

Основные изменения по сравнению с предыдущей версией:

1. **Использование UUID вместо SERIAL** для всех первичных ключей
2. **Структурированный контент** через JSONB вместо простого TEXT
3. **Новые модели данных** для типов контента и языков программирования
4. **Расширенная система валидации** контента
5. **Добавлены дополнительные поля** (description, is_active)
6. **Изменены индексы** для оптимизации PostgreSQL

---

## Models (SQLAlchemy ORM)

### Question
Таблица для хранения вопросов на интервью.

**Поля:**
- `id` - PRIMARY KEY (UUID) - Уникальный идентификатор
- `title` - VARCHAR(500) NOT NULL - Заголовок вопроса
- `slug` - VARCHAR(255) UNIQUE NOT NULL - URL-friendly идентификатор
- `content` - JSONB NOT NULL - Структурированный контент (список блоков)
- `difficulty` - ENUM('easy','medium','hard') NOT NULL - Уровень сложности
- `is_published` - BOOLEAN DEFAULT FALSE - Опубликован ли вопрос
- `created_at` - TIMESTAMPTZ - Дата создания (с временной зоной)
- `updated_at` - TIMESTAMPTZ - Дата обновления (с временной зоной)

**Индексы:**
- `idx_questions_slug` - по slug
- `idx_questions_difficulty` - по difficulty
- `idx_questions_difficulty_published` - составной по difficulty, is_published, created_at
- `idx_questions_content_gin` - GIN индекс для поиска по JSON полю content

**Валидации:**
- Автоматическая валидация структуры контента через `validate_content_structure()`

**Связи:**
- `answers` - One-to-Many с Answer (с каскадным удалением)
- `categories` - Many-to-Many с Category через question_categories

---

### Answer
Таблица для хранения ответов на вопросы.

**Поля:**
- `id` - PRIMARY KEY (UUID) - Уникальный идентификатор
- `question_id` - UUID FOREIGN KEY - Ссылка на вопрос
- `content` - JSONB NOT NULL - Структурированный контент (список блоков)
- `created_at` - TIMESTAMPTZ - Дата создания
- `updated_at` - TIMESTAMPTZ - Дата обновления

**Индексы:**
- `idx_answers_question` - по question_id

**Валидации:**
- Автоматическая валидация структуры контента через `validate_content_structure()`

**Связи:**
- `question` - Many-to-One с Question

---

### Category
Таблица для хранения категорий вопросов.

**Поля:**
- `id` - PRIMARY KEY (UUID) - Уникальный идентификатор
- `name` - VARCHAR(100) UNIQUE NOT NULL - Название категории
- `description` - TEXT NULLABLE - Описание категории
- `slug` - VARCHAR(100) UNIQUE NOT NULL - URL-friendly идентификатор
- `is_active` - BOOLEAN DEFAULT TRUE - Активна ли категория

**Индексы:**
- `idx_categories_name` - по name
- `idx_categories_slug` - по slug
- `idx_categories_active` - по is_active

**Связи:**
- `questions` - Many-to-Many с Question через question_categories

---

### QuestionCategory
Таблица связи для Many-to-Many отношения между Question и Category.

**Поля:**
- `question_id` - UUID FOREIGN KEY PRIMARY KEY - Ссылка на вопрос
- `category_id` - UUID FOREIGN KEY PRIMARY KEY - Ссылка на категорию
- `created_at` - TIMESTAMPTZ - Дата создания связи

**Индексы:**
- `idx_question_categories_question` - по question_id
- `idx_question_categories_category` - по category_id
- `idx_category_questions` - составной по category_id, created_at

---

## Enums (Перечисления)

### DifficultyQuestionLevel
Уровни сложности вопросов:
- `EASY` - Легкий
- `MEDIUM` - Средний
- `HARD` - Сложный

### ContentType
Типы блоков контента:
- `HEADING` - Заголовок
- `PARAGRAPH` - Абзац текста
- `CODE` - Блок кода
- `INFO` - Информационный блок
- `WARNING` - Предупреждение
- `IMAGE` - Изображение

### ProgrammingLanguage
Поддерживаемые языки программирования:
- `PYTHON`, `SQL`, `BASH`, `HTML`, `CSS`, `JSON`, `YAML`, `MARKDOWN`, `TEXT`, `OTHER`

---

## Структура контента (JSONB)

Контент в полях `content` хранится как список словарей (блоков), каждый со структурой:

```python
{
    "type": "code",  # Один из ContentType
    "data": {
        "text": "print('Hello World')",
        "language": "python"  # Один из ProgrammingLanguage
    },
    "order": 1
}
