"""SQLAlchemy models для базы данных."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List
from uuid import uuid4

from sqlalchemy import (
    TEXT,
    TIMESTAMP,
    Boolean,
    ForeignKey,
    Index,
    String,
    func,
    Enum as SQLEnum,
)
from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column, validates
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.hybrid import hybrid_property


Base = declarative_base()


class DifficultyQuestionLevel(str, Enum):
    """Уровни сложности вопросов."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ContentType(str, Enum):
    """Типы блоков контента."""
    HEADING = "heading"
    PARAGRAPH = "paragraph"
    CODE = "code"
    INFO = "info"
    WARNING = "warning"
    IMAGE = "image"


class ProgrammingLanguage(str, Enum):
    """Поддерживаемые языки программирования."""
    PYTHON = "python"
    SQL = "sql"
    BASH = "bash"
    HTML = "html"
    CSS = "css"
    JSON = "json"
    YAML = "yaml"
    MARKDOWN = "markdown"
    TEXT = "text"
    OTHER = "other"


class Question(Base):
    """Модель вопроса."""

    __tablename__ = "questions"

    ############# Main fields #############
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    title: Mapped[str] = mapped_column(
        String(500), 
        nullable=False, 
        index=True,
        comment='Заголовок вопроса'
    )
    slug: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        nullable=False, 
        index=True,
        comment='Уникальный слаг вопроса'
    )
    content: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        comment='Блоки контента в структурированном формате'
    )
    difficulty: Mapped[DifficultyQuestionLevel] = mapped_column(
        SQLEnum(DifficultyQuestionLevel), 
        nullable=False,
        index=True,
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean, 
        default=False, 
        index=True,
    )

    category_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=False,
        index=True,
        comment='ID категории вопроса'
    )

    ############# Time metadata #############
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    ############# Relationships #############
    answers: Mapped[List["Answer"]] = relationship(
        "Answer", back_populates="question", cascade="all, delete-orphan"
    )
    
    category: Mapped["Category"] = relationship(
        "Category", 
        back_populates="questions",
        lazy="joined"  # Опционально: загружать категорию вместе с вопросом
    )

    ############# Validations #############
    @validates('content')
    def validate_content_blocks(self, key, contents):
        """Валидация блоков контента ответа."""
        from app.validators import validate_content_structure
        return validate_content_structure(contents)
    
    # @hybrid_property
    # def has_code(self) -> bool:
    #     """Проверяет, есть ли в вопросе код."""
    #     return any(block['type'] == ContentType.CODE for block in self.content)

    __table_args__ = (
        # Индекс для поиска по JSON полям
        Index(
            'idx_questions_content_gin',
            'content',
            postgresql_using='gin'
        ),
        # Индекс для сложности и публикации
        Index(
            'idx_questions_difficulty_published',
            'difficulty', 
            'is_published',
            'created_at'
        ),
        Index(
            'idx_questions_category',
            'category_id',
            'is_published',
            'created_at'
        ),
    )


class Answer(Base):
    """Модель ответа на вопрос."""

    __tablename__ = "answers"

    ############# Main fields #############
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    question_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        comment='Блоки контента в структурированном формате'
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean, 
        default=False, 
        index=True,
    )

    ############# Time metadata #############
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    ############# Validations #############
    @validates('content')
    def validate_content_blocks(self, key, contents):
        """Валидация блоков контента ответа."""
        from app.validators import validate_content_structure
        return validate_content_structure(contents)

    # Relationships
    question: Mapped["Question"] = relationship("Question", back_populates="answers")


class Category(Base):
    """Модель категории вопросов."""

    __tablename__ = "categories"

    ############ Main fields #############
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    name: Mapped[str] = mapped_column(
        String(100), 
        unique=True, 
        nullable=False, 
        index=True,
        comment='Название категории',
    )
    description: Mapped[str] = mapped_column(
        TEXT, 
        nullable=True,
        comment='Описание категории',
    )
    slug: Mapped[str] = mapped_column(
        String(100), 
        unique=True, 
        nullable=False, 
        index=True,
        comment='Уникальный слаг категории',
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True, 
        index=True,
        comment='Активна ли категория',
    )

    questions: Mapped[List[Question]] = relationship(
        "Question",
        back_populates="category",
        cascade="none, delete-orphan",  # Опционально: удалять вопросы при удалении категории
        lazy="dynamic"
    )


# ПРИГОДИТСЯ ПОТОМ ДЛЯ ПОДКАТЕГОРИЙ
# class QuestionCategory(Base):
#     """Модель связи между вопросами и категориями."""

#     __tablename__ = "question_categories"

#     ############# Main fields #############
#     question_id: Mapped[uuid4] = mapped_column(
#         UUID,
#         ForeignKey("questions.id", ondelete="CASCADE"),
#         primary_key=True,
#         index=True,
#     )
#     category_id: Mapped[uuid4] = mapped_column(
#         UUID,
#         ForeignKey("categories.id", ondelete="CASCADE"),
#         primary_key=True,
#         index=True,
#     )

#     ############## Time metadata #############
#     created_at: Mapped[datetime] = mapped_column(
#         TIMESTAMP(timezone=True),
#         server_default=func.now(),
#         nullable=False
#     )

#     __table_args__ = (
#         # Индекс для быстрого поиска вопросов по категории
#         Index(
#             'idx_category_questions',
#             'category_id',
#             'created_at'
#         ),
#     )
