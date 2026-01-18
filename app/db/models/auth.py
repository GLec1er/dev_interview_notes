from typing import List, Optional
from uuid import uuid4
from sqlalchemy import (
    TIMESTAMP, 
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric, 
    String, 
    Text, 
    func,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from enum import Enum

from app.db.models.base import Base
from app.db.models.question_utils import QuestionCompletion, QuestionFavorite


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    """Модель пользователя"""
    __tablename__ = "users"

    ############# Main fields #############
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4
    )
    first_name: Mapped[str] = mapped_column(
        String(100), 
        index=True, 
        nullable=False
    )
    last_name: Mapped[str] = mapped_column(
        String(100), 
        index=True, 
        nullable=False
    )
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(500), 
        nullable=True,
    )

    ############# Security #############
    password: Mapped[str] = mapped_column(
        Text, 
        nullable=False,
    )
    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=True,
    )
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), 
        nullable=True, 
        default=None,
    )
    failed_login_attempts: Mapped[int] = mapped_column(
        Integer, 
        default=0,
    )
    locked_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), 
        nullable=True, 
        default=None,
    )

    ############# Rules for permission #############
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole),
        default=UserRole.USER,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True,
        index=True,
    )
    is_admin: Mapped[bool] = mapped_column(
        Boolean, 
        default=False,
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

    completed_questions: Mapped[List["QuestionCompletion"]] = relationship(
        "QuestionCompletion",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="dynamic"  # Для пагинации
    )

    favorite_questions: Mapped[list["QuestionFavorite"]] = relationship(
        "QuestionFavorite",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="dynamic", # Для пагинации
    )

    # Association proxy для прямого доступа к вопросам
    completed_question_objects = association_proxy(
        'completed_questions', 
        'question',
    )

    favorite_question_objects = association_proxy(
        'favorite_questions', 
        'question',
    )
