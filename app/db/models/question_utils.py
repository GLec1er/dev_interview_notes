from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    TIMESTAMP,
    ForeignKey,
    Index,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property

from app.db.models.base import Base


class QuestionCompletion(Base):
    """Модель отметки выполнения вопросов пользователями."""

    __tablename__ = "question_completions"

    ############# Main fields #############
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        comment="Уникальный идентификатор записи"
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID пользователя"
    )
    question_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID вопроса"
    )
    
    ############# Metadata #############
    completed_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="Дата и время отметки выполнения"
    )
    
    ############# Relationships #############
    user: Mapped["User"] = relationship(
        "User",
        back_populates="completed_questions",
        lazy="joined"  # Для быстрой загрузки пользователя
    )
    question: Mapped["Question"] = relationship(
        "Question",
        back_populates="completions",
        lazy="joined"  # Для быстрой загрузки вопроса
    )

    __table_args__ = (
        # Уникальная комбинация пользователь-вопрос
        UniqueConstraint(
            'user_id', 
            'question_id', 
            name='uq_user_question_completion'
        ),
        # Индекс для быстрого поиска по пользователю и дате
        Index(
            'idx_completions_user_completed_at',
            'user_id',
            'completed_at'
        ),
        # Индекс для быстрого подсчета выполненных вопросов
        Index(
            'idx_completions_question_count',
            'question_id',
            'completed_at'
        ),
        # Частичный индекс для активных пользователей
        Index(
            'idx_completions_active_users',
            'user_id',
            'question_id',
            postgresql_where=user_id.is_not(None)
        ),
    )


class QuestionFavorite(Base):
    """Модель добавления вопросов в избранное пользователями."""

    __tablename__ = "question_favorites"

    ############# Main fields #############
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        comment="Уникальный идентификатор записи"
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID пользователя"
    )
    question_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID вопроса"
    )
    
    ############# Metadata #############
    added_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="Дата и время добавления в избранное"
    )
    
    ############# Relationships #############
    user: Mapped["User"] = relationship(
        "User",
        back_populates="favorite_questions",
        lazy="joined"
    )
    question: Mapped["Question"] = relationship(
        "Question",
        back_populates="favorites",
        lazy="joined"
    )

    __table_args__ = (
        # Уникальная комбинация пользователь-вопрос
        UniqueConstraint(
            'user_id', 
            'question_id', 
            name='uq_user_question_favorite'
        ),
        # Индекс для быстрого поиска по пользователю
        Index(
            'idx_favorites_user_added_at',
            'user_id',
            'added_at'
        ),
        # Индекс для быстрого подсчета избранных вопросов
        Index(
            'idx_favorites_question_count',
            'question_id',
            'added_at'
        ),
        # Комбинированный индекс для частых запросов
        Index(
            'idx_favorites_user_question',
            'user_id',
            'question_id',
            unique=True  # Дублирует UniqueConstraint, но улучшает производительность
        ),
    )
