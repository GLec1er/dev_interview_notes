"""SQLAlchemy models для базы данных."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
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
from sqlalchemy.orm import relationship, Mapped, mapped_column, validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.hybrid import hybrid_property

from app.db.models.base import Base
from app.db.models.question_utils import QuestionCompletion, QuestionFavorite


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


class LevelCompanyInterview(str, Enum):
    """Уровни компаний по сложности интервью."""
    JUNIOR = "junior"
    MIDDLE = "middle"
    SENIOR = "senior"


class Company(Base):
    """Модель компании."""
    
    __tablename__ = "companies"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    name: Mapped[str] = mapped_column(
        String(200), 
        nullable=False, 
        index=True,
        comment='Название компании'
    )
    level: Mapped[LevelCompanyInterview] = mapped_column(
        SQLEnum(LevelCompanyInterview), 
        nullable=True,
        default=LevelCompanyInterview.JUNIOR.value,
        index=True,
        comment='Уровень сложности интервью в компании'
    )
    slug: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        nullable=False, 
        index=True,
        comment='Уникальный слаг компании'
    )
    description: Mapped[Optional[str]] = mapped_column(
        TEXT,
        nullable=True,
        comment='Описание компании'
    )
    logo_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment='URL логотипа компании'
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True, 
        index=True,
        comment='Активна ли компания'
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
    questions: Mapped[List["Question"]] = relationship(
        "Question", 
        back_populates="company",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    
    ############# Validations #############
    @validates('name')
    def validate_name(self, key, name):
        """Валидация названия компании."""
        if not name or len(name.strip()) == 0:
            raise ValueError("Название компании не может быть пустым")
        return name.strip()
    
    __table_args__ = (
        # Уникальный индекс для slug
        Index(
            'idx_companies_slug_active',
            'slug',
            'is_active'
        ),
    )


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
    
    # Связь с компанией
    company_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment='ID компании, связанной с вопросом'
    )

    category_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=False,
        index=True,
        comment='ID категории вопроса'
    )

    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        comment="ID пользователя"
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
    user: Mapped["User"] = relationship(
        "User",
        back_populates="questions",
        lazy="joined"  # Для быстрой загрузки пользователя
    )

    answers: Mapped[List["Answer"]] = relationship(
        "Answer", back_populates="question", cascade="all, delete-orphan"
    )
    
    category: Mapped["Category"] = relationship(
        "Category", 
        back_populates="questions",
        lazy="joined"  # Опционально: загружать категорию вместе с вопросом
    )
    
    company: Mapped[Optional["Company"]] = relationship(
        "Company", 
        back_populates="questions",
        lazy="joined"  # Опционально: загружать компанию вместе с вопросом
    )

    completions: Mapped[List[QuestionCompletion]] = relationship(
        "QuestionCompletion",
        back_populates="question",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )

    favorites: Mapped[list[QuestionFavorite]] = relationship(
        "QuestionFavorite",
        back_populates="question",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    
    # Association proxy для прямого доступа к пользователям
    completed_by_users = association_proxy(
        'completions', 
        'user'
    )

    # Association proxy для прямого доступа к пользователям
    favorited_by_users = association_proxy(
        'favorites', 
        'user'
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
        # Индекс для компании
        Index(
            'idx_questions_company',
            'company_id',
            'is_published',
            'created_at'
        ),
        # Составной индекс для частых запросов по компании и категории
        Index(
            'idx_questions_company_category',
            'company_id',
            'category_id',
            'is_published',
            'difficulty'
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

    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        comment="ID пользователя"
    )

    ############# Relationships #############
    user: Mapped["User"] = relationship(
        "User",
        back_populates="answers",
        lazy="joined"  # Для быстрой загрузки пользователя
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


class Roadmap(Base):
    """Модель дорожной карты профессии."""
    
    __tablename__ = "roadmaps"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment='Название дорожной карты'
    )
    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment='Уникальный слаг дорожной карты'
    )
    profession: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment='Профессия/специальность (например: Backend Developer)'
    )
    description: Mapped[Optional[str]] = mapped_column(
        TEXT,
        nullable=True,
        comment='Описание дорожной карты'
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        index=True,
        comment='Активна ли дорожная карта'
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
    roadmap_items: Mapped[List["RoadmapItem"]] = relationship(
        "RoadmapItem",
        back_populates="roadmap",
        cascade="all, delete-orphan",
    )
    
    __table_args__ = (
        Index(
            'idx_roadmaps_profession_active',
            'profession',
            'is_active'
        ),
    )


class RoadmapItem(Base):
    """Модель элемента дорожной карты (связь категория-вопросы)."""
    
    __tablename__ = "roadmap_items"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    roadmap_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roadmaps.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment='ID дорожной карты'
    )
    category_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment='ID категории'
    )
    # Может содержать выбранные вопросы из категории (JSON array с ID)
    question_ids: Mapped[Optional[List[str]]] = mapped_column(
        JSONB,
        nullable=True,
        default=list,
        comment='Список ID вопросов из этой категории (если пусто - все вопросы)'
    )
    order: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
        comment='Порядок элемента в дорожной карте'
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
    roadmap: Mapped["Roadmap"] = relationship(
        "Roadmap",
        back_populates="roadmap_items"
    )
    category: Mapped["Category"] = relationship("Category")
    
    __table_args__ = (
        Index(
            'idx_roadmap_items_roadmap_order',
            'roadmap_id',
            'order'
        ),
    )
